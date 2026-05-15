import {
  AccessTime,
  Apartment,
  ArrowForwardIos,
  Badge,
  ManageAccounts,
  EventNote,
  RestartAlt,
  School,
  Settings as SettingsIcon,
  Subject,
  Tune,
} from "@mui/icons-material";
import { Link } from "react-router";
import { useSystemConfig } from "../system-config";
import { settingsSections } from "../settings-meta";

const sectionIcons = {
  departments: <Apartment />,
  subjects: <Subject />,
  shifts: <AccessTime />,
  designations: <Badge />,
  educationalQualifications: <School />,
  roles: <ManageAccounts />,
  vacancies: <EventNote />,
};

export default function Settings() {
  const { config, resetConfig } = useSystemConfig();
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
              <p className="text-gray-600 mt-1">Choose a settings app to customize dropdown values.</p>
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
          <p className="mt-2 text-2xl font-bold text-gray-900">{settingsSections.length}</p>
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

      <div className="rounded-2xl bg-white shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Apps</h3>
            <p className="text-sm text-gray-600">Open any app to customize its options.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Tune fontSize="small" />
            Menu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {settingsSections.map((section) => (
            <Link
              key={section.key}
              to={section.path}
              className="group rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">{sectionIcons[section.key]}</div>
                <span className="text-xs font-semibold text-gray-500">{config[section.key].length} items</span>
              </div>
              <div className="mt-4">
                <h4 className="text-base font-semibold text-gray-900">{section.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{section.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-700">
                <span>Open</span>
                <ArrowForwardIos fontSize="inherit" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
