import { Add, DeleteOutline, RestartAlt, Settings as SettingsIcon, Tune } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  addOvertimeSystemConfigValue,
  addShiftSystemConfigValue,
  removeOvertimeSystemConfigValue,
  removeShiftSystemConfigValue,
  useSystemConfig,
} from "../system-config";
import { getSettingsSectionMeta, settingsSections } from "../settings-meta";

export default function SettingsSection() {
  const navigate = useNavigate();
  const { sectionKey } = useParams();
  const { config, addConfigValue, removeConfigValue, resetConfig } = useSystemConfig();
  const section = sectionKey ? getSettingsSectionMeta(sectionKey) : undefined;
  const [draft, setDraft] = useState("");
  const [shiftDraft, setShiftDraft] = useState({ name: "", startTime: "08:00", endTime: "14:00" });
  const [overtimeDraft, setOvertimeDraft] = useState({ teacherName: "", hourlyRate: "400" });

  const sectionCount = section ? config[section.key].length : 0;

  if (!section) {
    return (
      <div className="rounded-xl bg-white p-6 shadow space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">The selected settings app was not found.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Settings
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (section.key === "shifts") {
      addShiftSystemConfigValue(shiftDraft);
      setShiftDraft({ name: "", startTime: "08:00", endTime: "14:00" });
      return;
    }

    if (section.key === "overtimeConfig") {
      addOvertimeSystemConfigValue({
        teacherName: overtimeDraft.teacherName,
        hourlyRate: Number(overtimeDraft.hourlyRate),
      });
      setOvertimeDraft({ teacherName: "", hourlyRate: "400" });
      return;
    }

    addConfigValue(section.key, draft);
    setDraft("");
  };

  const handleDelete = (value: string) => {
    if (section.key === "shifts") {
      removeShiftSystemConfigValue(value);
      return;
    }

    if (section.key === "overtimeConfig") {
      removeOvertimeSystemConfigValue(value);
      return;
    }

    removeConfigValue(section.key, value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <SettingsIcon />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-gray-600 mt-1">Customize the values used by teacher and staff forms.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={resetConfig}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RestartAlt fontSize="small" />
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Option Group</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{section.title}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{sectionCount}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Available Apps</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{settingsSections.length}</p>
        </div>
      </div>

      <section className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            <Tune fontSize="small" />
            {sectionCount}
          </span>
        </div>

        <div className="p-6 space-y-4">
          {section.key === "shifts" ? (
            <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
              <input
                type="text"
                value={shiftDraft.name}
                onChange={(event) => setShiftDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Shift name"
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={shiftDraft.startTime}
                onChange={(event) => setShiftDraft((current) => ({ ...current, startTime: event.target.value }))}
                placeholder="Start time"
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={shiftDraft.endTime}
                onChange={(event) => setShiftDraft((current) => ({ ...current, endTime: event.target.value }))}
                placeholder="End time"
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Add />
                Add
              </button>
            </div>
          ) : section.key === "overtimeConfig" ? (
            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
              <input
                type="text"
                value={overtimeDraft.teacherName}
                onChange={(event) => setOvertimeDraft((current) => ({ ...current, teacherName: event.target.value }))}
                placeholder="Teacher name"
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min="0"
                value={overtimeDraft.hourlyRate}
                onChange={(event) => setOvertimeDraft((current) => ({ ...current, hourlyRate: event.target.value }))}
                placeholder="Hourly rate"
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Add />
                Add
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={section.placeholder}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Add />
                Add
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {section.key === "shifts"
              ? config.shifts.map((shift) => (
                  <button
                    key={shift.name}
                    type="button"
                    onClick={() => handleDelete(shift.name)}
                    className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    title="Remove shift"
                  >
                    <span>
                      {shift.name} {shift.startTime} - {shift.endTime}
                    </span>
                    <DeleteOutline fontSize="small" />
                  </button>
                ))
              : section.key === "overtimeConfig"
              ? config.overtimeConfig.map((entry) => (
                  <button
                    key={entry.teacherName}
                    type="button"
                    onClick={() => handleDelete(entry.teacherName)}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    title="Remove overtime rate"
                  >
                    {entry.teacherName} - ${entry.hourlyRate}/hr
                    <DeleteOutline fontSize="small" />
                  </button>
                ))
              : config[section.key].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleDelete(value)}
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
    </div>
  );
}
