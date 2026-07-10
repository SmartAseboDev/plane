# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import os
from datetime import datetime, timedelta
from urllib.parse import urlencode

import pytz

# Module imports
from plane.authentication.adapter.oauth import OauthAdapter
from plane.license.utils.instance_value import get_configuration_value
from plane.authentication.adapter.error import (
    AuthenticationException,
    AUTHENTICATION_ERROR_CODES,
)


class MicrosoftOAuthProvider(OauthAdapter):
    """Microsoft Entra ID (Azure AD) OAuth2 / OIDC provider.

    The authorize/token endpoints are tenant-scoped (single-tenant): the tenant id
    is configurable via ``MICROSOFT_TENANT_ID``, analogous to GitLab's ``HOST``.
    User info is read from Microsoft Graph (``/me``).
    """

    provider = "microsoft"
    scope = "openid email profile User.Read"

    def __init__(self, request, code=None, state=None, callback=None):
        (MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID) = get_configuration_value(
            [
                {
                    "key": "MICROSOFT_CLIENT_ID",
                    "default": os.environ.get("MICROSOFT_CLIENT_ID"),
                },
                {
                    "key": "MICROSOFT_CLIENT_SECRET",
                    "default": os.environ.get("MICROSOFT_CLIENT_SECRET"),
                },
                {
                    "key": "MICROSOFT_TENANT_ID",
                    "default": os.environ.get("MICROSOFT_TENANT_ID", "common"),
                },
            ]
        )

        if not (MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET and MICROSOFT_TENANT_ID):
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["MICROSOFT_NOT_CONFIGURED"],
                error_message="MICROSOFT_NOT_CONFIGURED",
            )

        self.tenant_id = MICROSOFT_TENANT_ID
        authority = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0"
        self.token_url = f"{authority}/token"
        self.userinfo_url = "https://graph.microsoft.com/v1.0/me"

        client_id = MICROSOFT_CLIENT_ID
        client_secret = MICROSOFT_CLIENT_SECRET

        redirect_uri = (
            f"""{"https" if request.is_secure() else "http"}://{request.get_host()}/auth/microsoft/callback/"""
        )
        url_params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": self.scope,
            "response_mode": "query",
            "state": state,
        }
        auth_url = f"{authority}/authorize?{urlencode(url_params)}"
        super().__init__(
            request,
            self.provider,
            client_id,
            self.scope,
            redirect_uri,
            auth_url,
            self.token_url,
            self.userinfo_url,
            client_secret,
            code,
            callback=callback,
        )

    def set_token_data(self):
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": self.code,
            "redirect_uri": self.redirect_uri,
            "grant_type": "authorization_code",
            "scope": self.scope,
        }
        token_response = self.get_user_token(data=data, headers={"Accept": "application/json"})
        # Microsoft returns expires_in as seconds-from-now (relative), not an epoch.
        expires_in = token_response.get("expires_in")
        super().set_token_data(
            {
                "access_token": token_response.get("access_token"),
                "refresh_token": token_response.get("refresh_token", None),
                "access_token_expired_at": (
                    datetime.now(tz=pytz.utc) + timedelta(seconds=expires_in) if expires_in else None
                ),
                "refresh_token_expired_at": None,
                "id_token": token_response.get("id_token", ""),
            }
        )

    def set_user_data(self):
        user_info_response = self.get_user_response()
        # Graph /me exposes no verification flag; entra directory emails are trusted.
        # `mail` can be null for some accounts, fall back to the userPrincipalName.
        email = user_info_response.get("mail") or user_info_response.get("userPrincipalName")
        if not email:
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["MICROSOFT_OAUTH_PROVIDER_ERROR"],
                error_message="MICROSOFT_OAUTH_PROVIDER_ERROR",
            )
        super().set_user_data(
            {
                "email": email,
                "user": {
                    "provider_id": user_info_response.get("id"),
                    "email": email,
                    "avatar": "",
                    "first_name": user_info_response.get("givenName"),
                    "last_name": user_info_response.get("surname"),
                    "is_password_autoset": True,
                },
            }
        )
