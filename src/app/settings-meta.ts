import type { SystemConfigKey } from "./system-config";

export type SettingsSectionMeta = {
  key: SystemConfigKey;
  title: string;
  description: string;
  placeholder: string;
  path: string;
};

export const settingsSections: SettingsSectionMeta[] = [
  {
    key: "overtimeConfig",
    title: "Overtime Config",
    description: "Assign hourly overtime payment per teacher.",
    placeholder: "Add a teacher overtime rate",
    path: "/settings/overtimeConfig",
  },
  {
    key: "departments",
    title: "Departments",
    description: "Used when adding teachers and staff.",
    placeholder: "Add a department",
    path: "/settings/departments",
  },
  {
    key: "subjects",
    title: "Subjects",
    description: "Used in the teacher profile form.",
    placeholder: "Add a subject",
    path: "/settings/subjects",
  },
  {
    key: "shifts",
    title: "Shifts",
    description: "Used in teacher and staff forms.",
    placeholder: "Add a shift name",
    path: "/settings/shifts",
  },
  {
    key: "designations",
    title: "Designations",
    description: "Used for staff and promotion options.",
    placeholder: "Add a designation",
    path: "/settings/designations",
  },
  {
    key: "educationalQualifications",
    title: "Educational Qualifications",
    description: "Used for staff and teacher qualification fields.",
    placeholder: "Add a qualification",
    path: "/settings/educationalQualifications",
  },
  {
    key: "roles",
    title: "Roles",
    description: "Create custom access roles and features.",
    placeholder: "Add a role",
    path: "/settings/roles",
  },
  {
    key: "vacancies",
    title: "Vacancy Management",
    description: "Create vacation or vacancy entries with date ranges.",
    placeholder: "Add a vacancy",
    path: "/settings/vacancies",
  },
  {
    key: "leaveTypes",
    title: "Leave Types",
    description: "Define leave types used when creating leave requests.",
    placeholder: "Add a leave type",
    path: "/settings/leaveTypes",
  },
];

export function getSettingsSectionMeta(sectionKey: string) {
  return settingsSections.find((section) => section.key === sectionKey);
}
