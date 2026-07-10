/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import { observer } from "mobx-react";
import { Controller, useForm } from "react-hook-form";
// plane imports
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TWorklog } from "@plane/types";
import { Input, ModalCore } from "@plane/ui";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

type TWorklogFormFields = {
  date: string;
  hours: number;
  minutes: number;
  description: string;
};

type TCreateUpdateWorklogModal = {
  isOpen: boolean;
  handleClose: () => void;
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  worklog?: TWorklog;
};

const getToday = () => new Date().toISOString().split("T")[0];

const getDefaultValues = (worklog?: TWorklog): TWorklogFormFields => ({
  date: worklog?.date ?? getToday(),
  hours: worklog ? Math.floor(worklog.duration / 60) : 0,
  minutes: worklog ? worklog.duration % 60 : 0,
  description: worklog?.description ?? "",
});

export const CreateUpdateWorklogModal = observer(function CreateUpdateWorklogModal(props: TCreateUpdateWorklogModal) {
  const { isOpen, handleClose, workspaceSlug, projectId, issueId, worklog } = props;
  // store hooks
  const { worklog: worklogStore } = useIssueDetail();
  // react hook form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TWorklogFormFields>({ defaultValues: getDefaultValues(worklog) });

  useEffect(() => {
    if (isOpen) reset(getDefaultValues(worklog));
  }, [isOpen, worklog, reset]);

  const onClose = () => {
    reset(getDefaultValues());
    handleClose();
  };

  const handleFormSubmit = async (formData: TWorklogFormFields) => {
    const duration = Math.trunc(Number(formData.hours) || 0) * 60 + Math.trunc(Number(formData.minutes) || 0);
    if (duration <= 0) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Logged time must be greater than 0 minutes." });
      return;
    }
    const payload = { date: formData.date, duration, description: formData.description?.trim() ?? "" };
    try {
      if (worklog?.id) {
        await worklogStore.updateWorklog(workspaceSlug, projectId, issueId, worklog.id, payload);
        setToast({ type: TOAST_TYPE.SUCCESS, title: "Success!", message: "Time entry updated." });
      } else {
        await worklogStore.createWorklog(workspaceSlug, projectId, issueId, payload);
        setToast({ type: TOAST_TYPE.SUCCESS, title: "Success!", message: "Time logged." });
      }
      onClose();
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Something went wrong. Please try again." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-5 p-5">
          <h3 className="text-h4-medium text-secondary">{worklog?.id ? "Edit time entry" : "Log time"}</h3>
          <div className="mt-2 space-y-3">
            <div>
              <label htmlFor="date" className="mb-2 text-secondary">
                Date
              </label>
              <Controller
                control={control}
                name="date"
                rules={{ required: "Date is required" }}
                render={({ field: { value, onChange, ref } }) => (
                  <Input
                    id="date"
                    type="date"
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    hasError={Boolean(errors.date)}
                    className="w-full"
                  />
                )}
              />
            </div>
            <div>
              <label className="mb-2 text-secondary">Time spent</label>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="hours"
                  rules={{ min: { value: 0, message: "Hours cannot be negative" } }}
                  render={({ field: { value, onChange, ref } }) => (
                    <Input
                      id="hours"
                      type="number"
                      min={0}
                      value={value}
                      onChange={onChange}
                      ref={ref}
                      hasError={Boolean(errors.hours)}
                      placeholder="0"
                      className="w-20"
                    />
                  )}
                />
                <span className="text-secondary">h</span>
                <Controller
                  control={control}
                  name="minutes"
                  rules={{
                    min: { value: 0, message: "Minutes cannot be negative" },
                    max: { value: 59, message: "Minutes must be 0-59" },
                  }}
                  render={({ field: { value, onChange, ref } }) => (
                    <Input
                      id="minutes"
                      type="number"
                      min={0}
                      max={59}
                      value={value}
                      onChange={onChange}
                      ref={ref}
                      hasError={Boolean(errors.minutes)}
                      placeholder="0"
                      className="w-20"
                    />
                  )}
                />
                <span className="text-secondary">m</span>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="mb-2 text-secondary">
                Note
                <span className="block text-caption-xs-regular">Optional</span>
              </label>
              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange, ref } }) => (
                  <Input
                    id="description"
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    placeholder="What did you work on?"
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t-[0.5px] border-subtle px-5 py-4">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" type="submit" loading={isSubmitting}>
            {worklog?.id ? (isSubmitting ? "Updating..." : "Update") : isSubmitting ? "Logging..." : "Log time"}
          </Button>
        </div>
      </form>
    </ModalCore>
  );
});
