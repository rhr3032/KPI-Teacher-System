import type { SystemConfigKey } from "./system-config";

export type SettingsSectionMeta = {
  key: SystemConfigKey;
  title: string;
  description: string;
  placeholder: string;
};

export const settingsSections: SettingsSectionMeta[] = [
  {
    key: "departments",
    title: "Departments",
    description: "Used when adding teachers and staff.",
    placeholder: "Add a department",
  },
  {
    key: "subjects",
    title: "Subjects",
    description: "Used in the teacher profile form.",
    placeholder: "Add a subject",
  },
  {
    key: "shifts",
    title: "Shifts",
    description: "Used in teacher and staff forms.",
    placeholder: "Add a shift name",
  },
  {
    key: "designations",
    title: "Designations",
    description: "Used for staff and promotion options.",
    placeholder: "Add a designation",
  },
  {
    key: "educationalQualifications",
    title: "Educational Qualifications",
    description: "Used for staff and teacher qualification fields.",
    placeholder: "Add a qualification",
  },
];

export function getSettingsSectionMeta(sectionKey: string) {
  return settingsSections.find((section) => section.key === sectionKey);
}
