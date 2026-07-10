/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Pencil, Plus, Timer, Trash2 } from "lucide-react";
// plane imports
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TWorklog } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useUser } from "@/hooks/store/user";
// local
import { CreateUpdateWorklogModal } from "../create-update-worklog-modal";
import { formatWorklogDuration } from "../helper";

type TIssueWorklogProperty = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export const IssueWorklogProperty = observer(function IssueWorklogProperty(props: TIssueWorklogProperty) {
  const { workspaceSlug, projectId, issueId, disabled } = props;
  // store hooks
  const { worklog: worklogStore, isWorklogModalOpen, toggleWorklogModal } = useIssueDetail();
  const { data: currentUser } = useUser();
  // local state
  const [editingWorklog, setEditingWorklog] = useState<TWorklog | undefined>(undefined);

  // fetch worklogs for this issue
  useSWR(
    workspaceSlug && projectId && issueId ? `ISSUE_WORKLOGS_${issueId}` : null,
    workspaceSlug && projectId && issueId ? () => worklogStore.fetchWorklogs(workspaceSlug, projectId, issueId) : null,
    { revalidateOnFocus: false }
  );

  const worklogIds = worklogStore.getWorklogIdsByIssueId(issueId) ?? [];
  const totalDuration = worklogStore.getTotalWorklogDurationByIssueId(issueId);

  const handleOpenCreate = () => {
    setEditingWorklog(undefined);
    toggleWorklogModal(true);
  };

  const handleOpenEdit = (worklog: TWorklog) => {
    setEditingWorklog(worklog);
    toggleWorklogModal(true);
  };

  const handleDelete = async (worklog: TWorklog) => {
    try {
      await worklogStore.removeWorklog(workspaceSlug, projectId, issueId, worklog.id);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success!", message: "Time entry removed." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not remove the time entry." });
    }
  };

  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex items-center justify-between">
        <div className="text-sm flex items-center gap-1.5 text-secondary">
          <Timer className="size-4 flex-shrink-0" />
          <span>Time tracking</span>
          {totalDuration > 0 && (
            <span className="font-medium text-primary">· {formatWorklogDuration(totalDuration)}</span>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1 rounded px-1.5 py-1 text-secondary hover:bg-layer-2 hover:text-primary"
          >
            <Plus className="size-3.5" />
            Log time
          </button>
        )}
      </div>

      {worklogIds.length > 0 ? (
        <div className="flex flex-col gap-1">
          {worklogIds.map((worklogId) => {
            const worklog = worklogStore.getWorklogById(worklogId);
            if (!worklog) return null;
            const isOwn = !!currentUser?.id && worklog.logged_by === currentUser.id;
            const loggedByName = worklog.logged_by_detail?.display_name ?? "Unknown user";
            return (
              <div
                key={worklogId}
                className="group flex items-start justify-between gap-2 rounded-md border border-subtle px-2.5 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm flex items-center gap-2">
                    <span className="font-medium text-primary">{formatWorklogDuration(worklog.duration)}</span>
                    <span className="text-xs text-secondary">{new Date(worklog.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs mt-0.5 truncate text-secondary">{loggedByName}</div>
                  {worklog.description && (
                    <div className="text-xs mt-0.5 break-words text-secondary">{worklog.description}</div>
                  )}
                </div>
                {!disabled && isOwn && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(worklog)}
                      className="rounded p-1 text-secondary hover:bg-layer-2 hover:text-primary"
                      aria-label="Edit time entry"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(worklog)}
                      className="rounded p-1 text-secondary hover:bg-layer-2 hover:text-danger-primary"
                      aria-label="Delete time entry"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-secondary">No time logged yet.</p>
      )}

      <CreateUpdateWorklogModal
        isOpen={isWorklogModalOpen}
        handleClose={() => toggleWorklogModal(false)}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        issueId={issueId}
        worklog={editingWorklog}
      />
    </div>
  );
});
