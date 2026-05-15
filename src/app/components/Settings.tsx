import { Add, DeleteOutline, RestartAlt, Settings as SettingsIcon, Tune } from "@mui/icons-material";
import { useState } from "react";
import {
  removeSystemConfigValue,
  useSystemConfig,
  type SystemConfigKey,
} from "../system-config";

type Section = {
  key: SystemConfigKey;
  title: string;
  description: string;
  placeholder: string;
};

const sections: Section[] = [
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
    placeholder: "Add a shift",
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

export default function Settings() {
  const { config, addConfigValue, removeConfigValue, resetConfig } = useSystemConfig();
  const [drafts, setDrafts] = useState<Record<SystemConfigKey, string>>({
    departments: "",
    subjects: "",
    shifts: "",
    designations: "",
    educationalQualifications: "",
  });

  const handleAdd = (key: SystemConfigKey) => {
    addConfigValue(key, drafts[key]);
    setDrafts((current) => ({ ...current, [key]: "" }));
  };

  const totalOptions = Object.values(config).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <SettingsIcon />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Manage the dropdown options used across teacher and staff forms.</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={resetConfig}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RestartAlt fontSize="small" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Total Option Groups</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{sections.length}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Total Dropdown Values</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalOptions}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">System Scope</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">Teacher + Staff</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sections.map((section) => (
          <section key={section.key} className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                <Tune fontSize="small" />
                {config[section.key].length}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={drafts[section.key]}
                  onChange={(event) => setDrafts((current) => ({ ...current, [section.key]: event.target.value }))}
                  placeholder={section.placeholder}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAdd(section.key)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Add />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {config[section.key].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => removeConfigValue(section.key, value)}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    title="Remove option"
                  >
                    {value}
                    <DeleteOutline fontSize="small" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
