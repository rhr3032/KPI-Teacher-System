import { useEffect, useState } from "react";

export type SystemConfigKey =
  | "departments"
  | "subjects"
  | "shifts"
  | "leaveTypes"
  | "designations"
  | "educationalQualifications"
  | "roles"
  | "vacancies";

export type ShiftOption = {
  name: string;
  startTime: string;
  endTime: string;
};

export type RoleOption = {
  name: string;
  description: string;
  features: string[];
  email?: string;
  password?: string;
};

export type VacancyOption = {
  name: string;
  reason: string;
  dateType: string;
  startDate: string;
  endDate: string;
  signature: string;
};

export type SystemConfig = {
  departments: string[];
  subjects: string[];
  shifts: ShiftOption[];
  leaveTypes: string[];
  designations: string[];
  educationalQualifications: string[];
  roles: RoleOption[];
  vacancies: VacancyOption[];
};

type StringConfigKey = Exclude<SystemConfigKey, "shifts" | "roles" | "vacancies">;

const STORAGE_KEY = "hrms-system-config";
const CONFIG_CHANGE_EVENT = "hrms-system-config-change";

const defaultSystemConfig: SystemConfig = {
  departments: ["Administration", "Accounts", "Science", "Mathematics", "English", "IT"],
  subjects: ["Mathematics", "Science", "English", "Computer Studies", "Accounting"],
  shifts: [
    { name: "Morning", startTime: "08:00", endTime: "14:00" },
    { name: "Day", startTime: "09:00", endTime: "17:00" },
    { name: "Evening", startTime: "14:00", endTime: "20:00" },
  ],
  leaveTypes: ["Sick Leave", "Casual Leave", "Maternity Leave", "Bereavement Leave", "Unpaid Leave"],
  designations: ["Teacher", "Senior Teacher", "HR Officer", "Payroll Assistant", "Systems Support"],
  educationalQualifications: ["SSC", "HSC", "Diploma", "BSc", "MSc", "BA", "MA"],
  roles: [
    {
      name: "Super Admin",
      description: "Full access to all modules and settings.",
      features: ["Dashboard", "Teacher Profiles", "Staff", "Settings"],
    },
    {
      name: "HR Manager",
      description: "Manages people records and configuration.",
      features: ["Teacher Profiles", "Attendance", "Payroll", "Staff", "Settings"],
    },
    {
      name: "Department Head",
      description: "Reviews staff and teacher activity.",
      features: ["Dashboard", "Teacher Profiles", "Attendance", "Staff"],
    },
  ],
  vacancies: [
    {
      name: "Summer Leave",
      reason: "Personal vacation during school break.",
      dateType: "Date Range",
      startDate: "2026-06-10",
      endDate: "2026-06-15",
      signature: "Admin Office",
    },
    {
      name: "One Day Permission",
      reason: "Short personal leave.",
      dateType: "Single Date",
      startDate: "2026-05-20",
      endDate: "2026-05-20",
      signature: "HR Manager",
    },
  ],
};

function normalizeOptions(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }

  const normalized = values
    .map((value) => String(value).trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeShiftOption(value: unknown, fallback: ShiftOption): ShiftOption | null {
  if (typeof value === "string") {
    const trimmedName = value.trim();

    if (!trimmedName) {
      return null;
    }

    return {
      name: trimmedName,
      startTime: fallback.startTime,
      endTime: fallback.endTime,
    };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const shift = value as Partial<ShiftOption>;
  const name = String(shift.name ?? "").trim();
  const startTime = String(shift.startTime ?? "").trim();
  const endTime = String(shift.endTime ?? "").trim();

  if (!name || !startTime || !endTime) {
    return null;
  }

  return { name, startTime, endTime };
}

function normalizeFeatures(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }

  const normalized = values
    .map((value) => String(value).trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeRoleOption(value: unknown, fallback: RoleOption): RoleOption | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const role = value as Partial<RoleOption>;
  const name = String(role.name ?? "").trim();
  const description = String(role.description ?? "").trim();
  const email = String(role.email ?? "").trim();
  const password = String(role.password ?? "").trim();
  const features = normalizeFeatures(role.features, fallback.features);

  if (!name) {
    return null;
  }

  return {
    name,
    description,
    email,
    password,
    features,
  };
}

function normalizeVacancyOption(value: unknown, fallback: VacancyOption): VacancyOption | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const vacancy = value as Partial<VacancyOption>;
  const name = String(vacancy.name ?? "").trim();
  const reason = String(vacancy.reason ?? "").trim();
  const dateType = String(vacancy.dateType ?? "").trim() || fallback.dateType;
  const startDate = String(vacancy.startDate ?? "").trim();
  const endDate = String(vacancy.endDate ?? "").trim() || startDate;
  const signature = String(vacancy.signature ?? "").trim();

  if (!name || !reason || !startDate) {
    return null;
  }

  return {
    name,
    reason,
    dateType,
    startDate,
    endDate,
    signature,
  };
}

function normalizeShifts(values: unknown, fallback: ShiftOption[]) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }

  const normalized = values
    .map((value) => normalizeShiftOption(value, fallback[0] ?? defaultSystemConfig.shifts[0]))
    .filter((value): value is ShiftOption => Boolean(value))
    .filter((value, index, array) => value.name.length > 0 && array.findIndex((entry) => entry.name === value.name) === index);

  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeRoles(values: unknown, fallback: RoleOption[]) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }

  const normalized = values
    .map((value) => normalizeRoleOption(value, fallback[0] ?? defaultSystemConfig.roles[0]))
    .filter((value): value is RoleOption => Boolean(value))
    .filter((value, index, array) => value.name.length > 0 && array.findIndex((entry) => entry.name === value.name) === index);

  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeVacancies(values: unknown, fallback: VacancyOption[]) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }

  const normalized = values
    .map((value) => normalizeVacancyOption(value, fallback[0] ?? defaultSystemConfig.vacancies[0]))
    .filter((value): value is VacancyOption => Boolean(value))
    .filter((value, index, array) => value.name.length > 0 && array.findIndex((entry) => entry.name === value.name) === index);

  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeConfig(rawValue: unknown): SystemConfig {
  const rawConfig = rawValue && typeof rawValue === "object" ? (rawValue as Partial<SystemConfig>) : {};

  return {
    departments: normalizeOptions(rawConfig.departments, defaultSystemConfig.departments),
    subjects: normalizeOptions(rawConfig.subjects, defaultSystemConfig.subjects),
    shifts: normalizeShifts(rawConfig.shifts, defaultSystemConfig.shifts),
      leaveTypes: normalizeOptions(rawConfig.leaveTypes, defaultSystemConfig.leaveTypes),
    designations: normalizeOptions(rawConfig.designations, defaultSystemConfig.designations),
    educationalQualifications: normalizeOptions(
      rawConfig.educationalQualifications,
      defaultSystemConfig.educationalQualifications,
    ),
    roles: normalizeRoles(rawConfig.roles, defaultSystemConfig.roles),
    vacancies: normalizeVacancies(rawConfig.vacancies, defaultSystemConfig.vacancies),
  };
}

export function getDefaultSystemConfig() {
  return normalizeConfig(defaultSystemConfig);
}

export function getSystemConfig() {
  if (typeof window === "undefined") {
    return getDefaultSystemConfig();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return getDefaultSystemConfig();
  }

  try {
    return normalizeConfig(JSON.parse(storedValue));
  } catch {
    return getDefaultSystemConfig();
  }
}

export function setSystemConfig(config: SystemConfig) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event(CONFIG_CHANGE_EVENT));
}

export function resetSystemConfig() {
  setSystemConfig(getDefaultSystemConfig());
}

export function addSystemConfigValue(key: StringConfigKey, value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return;
  }

  const nextConfig = getSystemConfig();
  const nextValues = nextConfig[key].includes(trimmedValue) ? nextConfig[key] : [trimmedValue, ...nextConfig[key]];

  setSystemConfig({
    ...nextConfig,
    [key]: nextValues,
  });
}

export function addShiftSystemConfigValue(shift: ShiftOption) {
  const name = shift.name.trim();
  const startTime = shift.startTime.trim();
  const endTime = shift.endTime.trim();

  if (!name || !startTime || !endTime) {
    return;
  }

  const nextConfig = getSystemConfig();
  const nextValues = nextConfig.shifts.some((entry) => entry.name === name)
    ? nextConfig.shifts
    : [{ name, startTime, endTime }, ...nextConfig.shifts];

  setSystemConfig({
    ...nextConfig,
    shifts: nextValues,
  });
}

export function removeSystemConfigValue(key: StringConfigKey, value: string) {
  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    [key]: nextConfig[key].filter((entry) => entry !== value),
  });
}

export function removeShiftSystemConfigValue(name: string) {
  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    shifts: nextConfig.shifts.filter((entry) => entry.name !== name),
  });
}

export function addRoleSystemConfigValue(role: RoleOption) {
  const name = role.name.trim();
  const description = role.description.trim();
  const features = normalizeFeatures(role.features, []);

  if (!name) {
    return;
  }

  const nextConfig = getSystemConfig();
  const nextValues = nextConfig.roles.some((entry) => entry.name === name)
    ? nextConfig.roles
    : [{ name, description, features }, ...nextConfig.roles];

  setSystemConfig({
    ...nextConfig,
    roles: nextValues,
  });
}

export function updateRoleSystemConfigValue(originalName: string, role: RoleOption) {
  const name = role.name.trim();
  const description = role.description.trim();
  const features = normalizeFeatures(role.features, []);

  if (!name) {
    return;
  }

  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    roles: nextConfig.roles.map((entry) =>
      entry.name === originalName
        ? {
            name,
            description,
            features,
          }
        : entry,
    ),
  });
}

export function removeRoleSystemConfigValue(name: string) {
  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    roles: nextConfig.roles.filter((entry) => entry.name !== name),
  });
}

export function addVacancySystemConfigValue(vacancy: VacancyOption) {
  const name = vacancy.name.trim();
  const reason = vacancy.reason.trim();
  const dateType = vacancy.dateType.trim() || "Date Range";
  const startDate = vacancy.startDate.trim();
  const endDate = vacancy.endDate.trim() || startDate;
  const signature = vacancy.signature.trim();

  if (!name || !reason || !startDate) {
    return;
  }

  const nextConfig = getSystemConfig();
  const nextValues = nextConfig.vacancies.some((entry) => entry.name === name)
    ? nextConfig.vacancies
    : [{ name, reason, dateType, startDate, endDate, signature }, ...nextConfig.vacancies];

  setSystemConfig({
    ...nextConfig,
    vacancies: nextValues,
  });
}

export function updateVacancySystemConfigValue(originalName: string, vacancy: VacancyOption) {
  const name = vacancy.name.trim();
  const reason = vacancy.reason.trim();
  const dateType = vacancy.dateType.trim() || "Date Range";
  const startDate = vacancy.startDate.trim();
  const endDate = vacancy.endDate.trim() || startDate;
  const signature = vacancy.signature.trim();

  if (!name || !reason || !startDate) {
    return;
  }

  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    vacancies: nextConfig.vacancies.map((entry) =>
      entry.name === originalName
        ? {
            name,
            reason,
            dateType,
            startDate,
            endDate,
            signature,
          }
        : entry,
    ),
  });
}

export function removeVacancySystemConfigValue(name: string) {
  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    vacancies: nextConfig.vacancies.filter((entry) => entry.name !== name),
  });
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(() => getSystemConfig());

  useEffect(() => {
    const syncConfig = () => setConfig(getSystemConfig());

    window.addEventListener("storage", syncConfig);
    window.addEventListener(CONFIG_CHANGE_EVENT, syncConfig);

    return () => {
      window.removeEventListener("storage", syncConfig);
      window.removeEventListener(CONFIG_CHANGE_EVENT, syncConfig);
    };
  }, []);

  const refreshConfig = () => setConfig(getSystemConfig());

  const updateConfig = (nextConfig: SystemConfig) => {
    setSystemConfig(nextConfig);
    refreshConfig();
  };

  const addConfigValue = (key: StringConfigKey, value: string) => {
    addSystemConfigValue(key, value);
    refreshConfig();
  };

  const removeConfigValue = (key: StringConfigKey, value: string) => {
    removeSystemConfigValue(key, value);
    refreshConfig();
  };

  const resetConfig = () => {
    resetSystemConfig();
    refreshConfig();
  };

  return {
    config,
    setConfig: updateConfig,
    addConfigValue,
    removeConfigValue,
    resetConfig,
  };
}
