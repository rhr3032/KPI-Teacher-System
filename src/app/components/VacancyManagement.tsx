import { Add, CalendarMonth, DeleteOutline, Edit, EventNote, RestartAlt, Save } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  addVacancySystemConfigValue,
  removeVacancySystemConfigValue,
  updateVacancySystemConfigValue,
  useSystemConfig,
  type VacancyOption,
} from "../system-config";
import { settingsSections } from "../settings-meta";

type VacancyFormState = VacancyOption & {
  dateType: "Single Date" | "Date Range";
};

export default function VacancyManagement() {
  const navigate = useNavigate();
  const { config, resetConfig } = useSystemConfig();
  const [editingVacancyName, setEditingVacancyName] = useState<string | null>(null);
  const [form, setForm] = useState<VacancyFormState>({
    name: "",
    reason: "",
    dateType: "Date Range",
    startDate: "2026-05-15",
    endDate: "2026-05-16",
    signature: "",
  });

  const totalRangeItems = useMemo(
    () => config.vacancies.filter((vacancy) => vacancy.dateType === "Date Range").length,
    [config.vacancies],
  );

  const totalSingleDayItems = useMemo(
    () => config.vacancies.filter((vacancy) => vacancy.dateType === "Single Date").length,
    [config.vacancies],
  );

  const clearForm = () => {
    setEditingVacancyName(null);
    setForm({
      name: "",
      reason: "",
      dateType: "Date Range",
      startDate: "2026-05-15",
      endDate: "2026-05-16",
      signature: "",
    });
  };

  const openVacancyForEdit = (vacancy: VacancyOption) => {
    setEditingVacancyName(vacancy.name);
    setForm({
      name: vacancy.name,
      reason: vacancy.reason,
      dateType: vacancy.dateType === "Single Date" ? "Single Date" : "Date Range",
      startDate: vacancy.startDate,
      endDate: vacancy.endDate || vacancy.startDate,
      signature: vacancy.signature,
    });
  };

  const saveVacancy = () => {
    const payload: VacancyOption = {
      name: form.name,
      reason: form.reason,
      dateType: form.dateType,
      startDate: form.startDate,
      endDate: form.dateType === "Single Date" ? form.startDate : form.endDate,
      signature: form.signature,
    };

    if (editingVacancyName) {
      updateVacancySystemConfigValue(editingVacancyName, payload);
    } else {
      addVacancySystemConfigValue(payload);
    }

    clearForm();
  };

  const deleteVacancy = (vacancy: VacancyOption) => {
    removeVacancySystemConfigValue(vacancy.name);
    if (editingVacancyName === vacancy.name) {
      clearForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <CalendarMonth />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Vacancy Management</h2>
              <p className="text-gray-600 mt-1">Create vacancy or vacation records with a single date or a date range.</p>
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
          <p className="text-sm text-gray-600">Records</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{config.vacancies.length}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Single Date</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalSingleDayItems}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Date Range</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalRangeItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{editingVacancyName ? "Edit Vacancy" : "Create Vacancy"}</h3>
              <p className="text-sm text-gray-600 mt-1">Add the vacancy name, reason, dates, and signature manually.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <EventNote fontSize="small" />
              Manual
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
                <span>Vacancy Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Summer Leave"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
                <span>Reason</span>
                <textarea
                  value={form.reason}
                  onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="Write the reason"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Date Type</span>
                <select
                  value={form.dateType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dateType: event.target.value as VacancyFormState["dateType"],
                      endDate: event.target.value === "Single Date" ? current.startDate : current.endDate,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Single Date">Single Date</option>
                  <option value="Date Range">Date Range</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Signature</span>
                <input
                  type="text"
                  value={form.signature}
                  onChange={(event) => setForm((current) => ({ ...current, signature: event.target.value }))}
                  placeholder="Approved by"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Start Date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                      endDate: current.dateType === "Single Date" ? event.target.value : current.endDate,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>End Date</span>
                <input
                  type="date"
                  value={form.dateType === "Single Date" ? form.startDate : form.endDate}
                  onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                  disabled={form.dateType === "Single Date"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveVacancy}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Save fontSize="small" />
                {editingVacancyName ? "Update Vacancy" : "Create Vacancy"}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Saved Vacancies</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your custom vacancy and vacation entries.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <EventNote fontSize="small" />
              {config.vacancies.length}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {config.vacancies.map((vacancy) => (
              <div key={vacancy.name} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{vacancy.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{vacancy.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {vacancy.dateType} | {vacancy.startDate} to {vacancy.endDate}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Signature: {vacancy.signature || "-"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openVacancyForEdit(vacancy)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Edit fontSize="small" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteVacancy(vacancy)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      <DeleteOutline fontSize="small" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
