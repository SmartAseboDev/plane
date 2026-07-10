/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { set } from "lodash-es";
import { action, makeObservable, observable, runInAction } from "mobx";
// plane types
import type { TWorklog, TWorklogEditableFields, TWorklogMap, TWorklogIdMap } from "@plane/types";
// services
import { WorklogService } from "@/services/issue";
// types
import type { IIssueDetail } from "./root.store";

export interface IIssueWorklogStoreActions {
  addWorklogs: (issueId: string, worklogs: TWorklog[]) => void;
  fetchWorklogs: (workspaceSlug: string, projectId: string, issueId: string) => Promise<TWorklog[]>;
  createWorklog: (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TWorklogEditableFields>
  ) => Promise<TWorklog>;
  updateWorklog: (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    worklogId: string,
    data: Partial<TWorklogEditableFields>
  ) => Promise<TWorklog>;
  removeWorklog: (workspaceSlug: string, projectId: string, issueId: string, worklogId: string) => Promise<void>;
}

export interface IIssueWorklogStore extends IIssueWorklogStoreActions {
  // observables
  worklogs: TWorklogIdMap;
  worklogMap: TWorklogMap;
  // helper methods
  getWorklogIdsByIssueId: (issueId: string) => string[] | undefined;
  getWorklogById: (worklogId: string) => TWorklog | undefined;
  getTotalWorklogDurationByIssueId: (issueId: string) => number;
}

export class IssueWorklogStore implements IIssueWorklogStore {
  // observables
  worklogs: TWorklogIdMap = {};
  worklogMap: TWorklogMap = {};
  // root store
  rootIssueDetailStore: IIssueDetail;
  // services
  worklogService;

  constructor(rootStore: IIssueDetail) {
    makeObservable(this, {
      // observables
      worklogs: observable,
      worklogMap: observable,
      // actions
      addWorklogs: action.bound,
      fetchWorklogs: action,
      createWorklog: action,
      updateWorklog: action,
      removeWorklog: action,
    });
    // root store
    this.rootIssueDetailStore = rootStore;
    // services
    this.worklogService = new WorklogService();
  }

  // helper methods
  getWorklogIdsByIssueId = (issueId: string) => {
    if (!issueId) return undefined;
    return this.worklogs[issueId] ?? undefined;
  };

  getWorklogById = (worklogId: string) => {
    if (!worklogId) return undefined;
    return this.worklogMap[worklogId] ?? undefined;
  };

  getTotalWorklogDurationByIssueId = (issueId: string) => {
    const worklogIds = this.worklogs[issueId] ?? [];
    return worklogIds.reduce((total, worklogId) => total + (this.worklogMap[worklogId]?.duration ?? 0), 0);
  };

  // actions
  addWorklogs = (issueId: string, worklogs: TWorklog[]) => {
    runInAction(() => {
      this.worklogs[issueId] = worklogs.map((worklog) => worklog.id);
      worklogs.forEach((worklog) => set(this.worklogMap, worklog.id, worklog));
    });
  };

  fetchWorklogs = async (workspaceSlug: string, projectId: string, issueId: string) => {
    const response = await this.worklogService.fetchWorklogs(workspaceSlug, projectId, issueId);
    this.addWorklogs(issueId, response);
    return response;
  };

  createWorklog = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TWorklogEditableFields>
  ) => {
    const response = await this.worklogService.createWorklog(workspaceSlug, projectId, issueId, data);
    runInAction(() => {
      if (!this.worklogs[issueId]) this.worklogs[issueId] = [];
      this.worklogs[issueId].unshift(response.id);
      set(this.worklogMap, response.id, response);
    });
    return response;
  };

  updateWorklog = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    worklogId: string,
    data: Partial<TWorklogEditableFields>
  ) => {
    const initialData = { ...this.worklogMap[worklogId] };
    try {
      runInAction(() => {
        Object.keys(data).forEach((key) => {
          set(this.worklogMap, [worklogId, key], data[key as keyof TWorklogEditableFields]);
        });
      });
      const response = await this.worklogService.updateWorklog(workspaceSlug, projectId, issueId, worklogId, data);
      return response;
    } catch (error) {
      console.error("error", error);
      runInAction(() => {
        Object.keys(initialData).forEach((key) => {
          set(this.worklogMap, [worklogId, key], initialData[key as keyof TWorklog]);
        });
      });
      throw error;
    }
  };

  removeWorklog = async (workspaceSlug: string, projectId: string, issueId: string, worklogId: string) => {
    await this.worklogService.deleteWorklog(workspaceSlug, projectId, issueId, worklogId);
    const worklogIndex = (this.worklogs[issueId] ?? []).findIndex((_worklogId) => _worklogId === worklogId);
    if (worklogIndex >= 0)
      runInAction(() => {
        this.worklogs[issueId].splice(worklogIndex, 1);
        delete this.worklogMap[worklogId];
      });
  };
}
