import type { ReactNode } from "react";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

export type NavItem = { title: string; url: string; icon: ReactNode };
export type NavSection = { label: string; items: NavItem[] };

export const HR_NAV: NavSection[] = [
  {
    label: "القائمة الرئيسية",
    items: [
      { title: "الرئيسية", url: "/hr", icon: <DashboardRoundedIcon /> },
      { title: "الموظفون", url: "/hr/employees", icon: <BadgeRoundedIcon /> },
      { title: "الأقسام", url: "/hr/departments", icon: <ApartmentRoundedIcon /> },
      { title: "المسميات الوظيفية", url: "/hr/job-titles", icon: <WorkRoundedIcon /> },
    ],
  },
  {
    label: "الحضور والإجازات",
    items: [
      { title: "الحضور والانصراف", url: "/hr/attendance", icon: <EventAvailableRoundedIcon /> },
      { title: "طلبات الإجازة", url: "/hr/leave-requests", icon: <FactCheckRoundedIcon /> },
      { title: "أنواع الإجازات", url: "/hr/leave-types", icon: <DescriptionRoundedIcon /> },
    ],
  },
  {
    label: "الرواتب",
    items: [
      { title: "مسيرات الرواتب", url: "/hr/payroll", icon: <PaidRoundedIcon /> },
      { title: "عناصر الراتب", url: "/hr/salary-components", icon: <ReceiptLongRoundedIcon /> },
    ],
  },
  {
    label: "النظام",
    items: [
      { title: "أنواع الوثائق", url: "/hr/document-types", icon: <DescriptionRoundedIcon /> },
      { title: "سجل التغييرات", url: "/hr/audit", icon: <HistoryRoundedIcon /> },
      { title: "الإعدادات", url: "/hr/settings", icon: <SettingsRoundedIcon /> },
    ],
  },
];

export const MANAGER_NAV: NavSection[] = [
  {
    label: "فريقي",
    items: [
      { title: "الرئيسية", url: "/manager", icon: <DashboardRoundedIcon /> },
      { title: "أعضاء الفريق", url: "/manager/team", icon: <GroupsRoundedIcon /> },
      { title: "اعتماد الإجازات", url: "/manager/leave-approvals", icon: <FactCheckRoundedIcon /> },
    ],
  },
];

export const ME_NAV: NavSection[] = [
  {
    label: "الخدمة الذاتية",
    items: [
      { title: "الرئيسية", url: "/me", icon: <DashboardRoundedIcon /> },
      { title: "حضوري", url: "/me/attendance", icon: <EventAvailableRoundedIcon /> },
      { title: "إجازاتي", url: "/me/leave", icon: <FactCheckRoundedIcon /> },
      { title: "قسائم الراتب", url: "/me/payslips", icon: <PaidRoundedIcon /> },
      { title: "ملفي الشخصي", url: "/me/profile", icon: <PersonRoundedIcon /> },
    ],
  },
];
