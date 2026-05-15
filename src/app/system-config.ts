import { useEffect, useState } from "react";

export type SystemConfigKey =
  | "departments"
  | "subjects"
  | "shifts"
  | "designations"
  | "educationalQualifications";

export type ShiftOption = {
  name: string;
  startTime: string;
  endTime: string;
};

export type SystemConfig = {
  departments: string[];
  subjects: string[];
  shifts: ShiftOption[];
  designations: string[];
  educationalQualifications: string[];
};

type StringConfigKey = Exclude<SystemConfigKey, "shifts">;

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
  designations: ["Teacher", "Senior Teacher", "HR Officer", "Payroll Assistant", "Systems Support"],
  educationalQualifications: ["SSC", "HSC", "Diploma", "BSc", "MSc", "BA", "MA"],
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

function normalizeConfig(rawValue: unknown): SystemConfig {
  const rawConfig = rawValue && typeof rawValue === "object" ? (rawValue as Partial<SystemConfig>) : {};

  return {
    departments: normalizeOptions(rawConfig.departments, defaultSystemConfig.departments),
    subjects: normalizeOptions(rawConfig.subjects, defaultSystemConfig.subjects),
    shifts: normalizeShifts(rawConfig.shifts, defaultSystemConfig.shifts),
    designations: normalizeOptions(rawConfig.designations, defaultSystemConfig.designations),
    educationalQualifications: normalizeOptions(
      rawConfig.educationalQualifications,
      defaultSystemConfig.educationalQualifications,
    ),
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

  const addConfigValue = (key: SystemConfigKey, value: string) => {
    addSystemConfigValue(key, value);
    refreshConfig();
  };

  const removeConfigValue = (key: SystemConfigKey, value: string) => {
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
