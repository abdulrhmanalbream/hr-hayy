export type QuickActionArea = "hr" | "me";

export type QuickActionView = "HUB" | "NEW_EMPLOYEE" | "RUN_PAYROLL" | "CHECK_IN_OUT" | "NEW_LEAVE_REQUEST" | "SUCCESS";

export type QuickSuccessPayload = {
  title: string;
  subtitle: string;
};

export type LeaveTypeOption = { id: string; nameAr: string; annualDays: number | null };
export type DepartmentOption = { id: string; name: string };
export type JobTitleOption = { id: string; name: string };
