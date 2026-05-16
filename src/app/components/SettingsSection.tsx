import { Add, DeleteOutline, RestartAlt, Settings as SettingsIcon, Tune } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  addOvertimeSystemConfigValue,
  addShiftSystemConfigValue,
  removeOvertimeSystemConfigValue,
  removeShiftSystemConfigValue,
  addInvoiceSystemConfigValue,
  removeInvoiceSystemConfigValue,
  useSystemConfig,
} from "../system-config";
import { getSettingsSectionMeta, settingsSections } from "../settings-meta";
import { getTeachers } from "../teacher-data";

export default function SettingsSection() {
  const navigate = useNavigate();
  const { sectionKey } = useParams();
  const { config, addConfigValue, removeConfigValue, resetConfig } = useSystemConfig();
  const section = sectionKey ? getSettingsSectionMeta(sectionKey) : undefined;

  const [draft, setDraft] = useState("");
  const [shiftDraft, setShiftDraft] = useState({ name: "", startTime: "08:00", endTime: "14:00" });
  const [overtimeDraft, setOvertimeDraft] = useState({ teacherName: "", department: "", hourlyRate: "400" });
  const [overtimeSearch, setOvertimeSearch] = useState("");
  const [overtimeDepartmentFilter, setOvertimeDepartmentFilter] = useState("");
  const [editingOvertimeKey, setEditingOvertimeKey] = useState<string | null>(null);
  const [editingOvertimeRate, setEditingOvertimeRate] = useState("");

  const [invoiceDraft, setInvoiceDraft] = useState({ name: "", watermarkLogo: "", header: "", footer: "" });

  const teachers = getTeachers();
  const overtimeTeachers = overtimeDraft.department ? teachers.filter((t) => t.department === overtimeDraft.department) : [];
  const overtimeDepartments = Array.from(new Set(config.overtimeConfig.map((entry) => entry.department))).sort();

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

  const sectionCount = section ? (config as any)[section.key].length : 0;

  const handleAdd = () => {
    if (section.key === "shifts") {
      addShiftSystemConfigValue(shiftDraft);
      setShiftDraft({ name: "", startTime: "08:00", endTime: "14:00" });
      return;
    }

    if (section.key === "overtimeConfig") {
      addOvertimeSystemConfigValue({
        teacherName: overtimeDraft.teacherName,
        department: overtimeDraft.department,
        hourlyRate: Number(overtimeDraft.hourlyRate),
      });
      setOvertimeDraft({ teacherName: "", department: "", hourlyRate: "400" });
      return;
    }

    if (section.key === "invoiceConfig") {
      addInvoiceSystemConfigValue({
        name: invoiceDraft.name,
        watermarkLogo: invoiceDraft.watermarkLogo,
        header: invoiceDraft.header,
        footer: invoiceDraft.footer,
      });
      setInvoiceDraft({ name: "", watermarkLogo: "", header: "", footer: "" });
      return;
    }

    addConfigValue(section.key as any, draft);
    setDraft("");
  };

  const handleDelete = (value: string) => {
    if (section.key === "shifts") {
      removeShiftSystemConfigValue(value);
      return;
    }

    if (section.key === "overtimeConfig") {
      const [teacherName, department] = value.split("||");
      removeOvertimeSystemConfigValue(teacherName, department);
      return;
    }

    if (section.key === "invoiceConfig") {
      removeInvoiceSystemConfigValue(value);
      return;
    }

    removeConfigValue(section.key as any, value);
  };

  const startInlineEdit = (teacherName: string, department: string, hourlyRate: number) => {
    setEditingOvertimeKey(`${teacherName}||${department}`);
    setEditingOvertimeRate(String(hourlyRate));
  };

  const saveInlineEdit = (teacherName: string, department: string) => {
    addOvertimeSystemConfigValue({ teacherName, department, hourlyRate: Number(editingOvertimeRate) });
    setEditingOvertimeKey(null);
    setEditingOvertimeRate("");
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
          ) : section.key === "invoiceConfig" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] items-end">
                <div>
                  <label className="text-xs text-gray-600">Template name</label>
                  <input
                    type="text"
                    value={invoiceDraft.name}
                    onChange={(event) => setInvoiceDraft((c) => ({ ...c, name: event.target.value }))}
                    placeholder="Template name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Logo / Watermark</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload invoice watermark or logo"
                      title="Upload invoice watermark or logo"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setInvoiceDraft((c) => ({ ...c, watermarkLogo: String(reader.result ?? "") }));
                        reader.readAsDataURL(file);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {invoiceDraft.watermarkLogo ? (
                      <img src={invoiceDraft.watermarkLogo} alt="logo preview" className="h-10 w-14 object-contain rounded" />
                    ) : (
                      <div className="h-10 w-14 rounded bg-gray-100 text-xs flex items-center justify-center text-gray-500">Preview</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                  >
                    <Add />
                    Add
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-gray-600">Header image</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload invoice header image"
                      title="Upload invoice header image"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setInvoiceDraft((c) => ({ ...c, header: String(reader.result ?? "") }));
                        reader.readAsDataURL(file);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {invoiceDraft.header ? (
                      <img src={invoiceDraft.header} alt="header preview" className="h-10 w-40 object-contain rounded" />
                    ) : (
                      <div className="h-10 w-40 rounded bg-gray-100 text-xs flex items-center justify-center text-gray-500">Preview</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Footer image</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload invoice footer image"
                      title="Upload invoice footer image"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setInvoiceDraft((c) => ({ ...c, footer: String(reader.result ?? "") }));
                        reader.readAsDataURL(file);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {invoiceDraft.footer ? (
                      <img src={invoiceDraft.footer} alt="footer preview" className="h-10 w-40 object-contain rounded" />
                    ) : (
                      <div className="h-10 w-40 rounded bg-gray-100 text-xs flex items-center justify-center text-gray-500">Preview</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : section.key === "overtimeConfig" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_1fr_auto]">
                <select
                  value={overtimeDraft.department}
                  onChange={(event) =>
                    setOvertimeDraft((current) => ({ ...current, department: event.target.value, teacherName: "" }))
                  }
                  aria-label="Overtime department"
                  title="Overtime department"
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  {config.departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <select
                  value={overtimeDraft.teacherName}
                  onChange={(event) => setOvertimeDraft((current) => ({ ...current, teacherName: event.target.value }))}
                  aria-label="Overtime teacher"
                  title="Overtime teacher"
                  disabled={!overtimeDraft.department}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">{overtimeDraft.department ? "Select teacher" : "Select department first"}</option>
                  {overtimeTeachers.length > 0
                    ? overtimeTeachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.name}>
                          {teacher.name}
                        </option>
                      ))
                    : overtimeDraft.department ? (
                        <option value="" disabled>
                          No teachers found in this department
                        </option>
                      ) : null}
                </select>
                <input
                  type="number"
                  min="0"
                  value={overtimeDraft.hourlyRate}
                  onChange={(event) => setOvertimeDraft((current) => ({ ...current, hourlyRate: event.target.value }))}
                  placeholder="Hourly rate"
                  disabled={!overtimeDraft.teacherName}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  value={overtimeSearch}
                  onChange={(event) => setOvertimeSearch(event.target.value)}
                  placeholder="Search teacher name or rate"
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setOvertimeSearch("")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <select
                  value={overtimeDepartmentFilter}
                  onChange={(event) => setOvertimeDepartmentFilter(event.target.value)}
                  aria-label="Filter overtime config by department"
                  title="Filter overtime config by department"
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {overtimeDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setOvertimeDepartmentFilter("")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Clear Filter
                </button>
              </div>
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
            {section.key === "shifts" ? (
              config.shifts.map((shift) => (
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
            ) : section.key === "invoiceConfig" ? (
              config.invoiceConfig.map((entry) => (
                <div
                  key={entry.name}
                  className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                >
                  <div className="flex items-center gap-3">
                    {entry.watermarkLogo ? (
                      <img src={entry.watermarkLogo} alt={`${entry.name} logo`} className="h-8 w-12 object-contain rounded" />
                    ) : (
                      <div className="h-8 w-12 rounded bg-gray-100 text-xs flex items-center justify-center text-gray-500">No logo</div>
                    )}
                    <div className="text-sm">
                      <div className="font-semibold">{entry.name}</div>
                      {entry.header ? <div className="text-xs text-gray-600">Header set</div> : null}
                      {entry.footer ? <div className="text-xs text-gray-600">Footer set</div> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.name)}
                    className="rounded-full p-1 hover:bg-blue-100 ml-2"
                    title="Remove template"
                  >
                    <DeleteOutline fontSize="small" />
                  </button>
                </div>
              ))
            ) : section.key === "overtimeConfig" ? (
              config.overtimeConfig
                .filter((entry) => !overtimeDepartmentFilter || entry.department === overtimeDepartmentFilter)
                .filter((entry) => {
                  const query = overtimeSearch.trim().toLowerCase();
                  if (!query) return true;
                  return (
                    entry.teacherName.toLowerCase().includes(query) ||
                    entry.department.toLowerCase().includes(query) ||
                    String(entry.hourlyRate).includes(query)
                  );
                })
                .map((entry) =>
                  editingOvertimeKey === `${entry.teacherName}||${entry.department}` ? (
                    <div
                      key={`${entry.teacherName}||${entry.department}`}
                      className="flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                    >
                      <span>
                        {entry.teacherName} ({entry.department})
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={editingOvertimeRate}
                        onChange={(event) => setEditingOvertimeRate(event.target.value)}
                        placeholder="Hourly rate"
                        aria-label={`Hourly rate for ${entry.teacherName}`}
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => saveInlineEdit(entry.teacherName, entry.department)}
                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOvertimeKey(null);
                          setEditingOvertimeRate("");
                        }}
                        className="rounded-md border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      key={`${entry.teacherName}||${entry.department}`}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      <span>
                        {entry.teacherName} ({entry.department}) - ${entry.hourlyRate}/hr
                      </span>
                      <button
                        type="button"
                        onClick={() => startInlineEdit(entry.teacherName, entry.department, entry.hourlyRate)}
                        className="rounded-full px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        title="Edit overtime rate"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(`${entry.teacherName}||${entry.department}`)}
                        className="rounded-full p-1 hover:bg-blue-100"
                        title="Remove overtime rate"
                      >
                        <DeleteOutline fontSize="small" />
                      </button>
                    </div>
                  ),
                )
            ) : (
              (config as any)[section.key].map((value: string) => (
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
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
