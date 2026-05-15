import { useEffect, useState } from "react";

export type SystemConfigKey =
  | "departments"
  | "subjects"
  | "shifts"
  | "designations"
  | "educationalQualifications";

export type SystemConfig = Record<SystemConfigKey, string[]>;

const STORAGE_KEY = "hrms-system-config";
const CONFIG_CHANGE_EVENT = "hrms-system-config-change";

const defaultSystemConfig: SystemConfig = {
  departments: ["Administration", "Accounts", "Science", "Mathematics", "English", "IT"],
  subjects: ["Mathematics", "Science", "English", "Computer Studies", "Accounting"],
  shifts: ["Morning", "Day", "Evening"],
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

function normalizeConfig(rawValue: unknown): SystemConfig {
  const rawConfig = rawValue && typeof rawValue === "object" ? (rawValue as Partial<SystemConfig>) : {};

  return {
    departments: normalizeOptions(rawConfig.departments, defaultSystemConfig.departments),
    subjects: normalizeOptions(rawConfig.subjects, defaultSystemConfig.subjects),
    shifts: normalizeOptions(rawConfig.shifts, defaultSystemConfig.shifts),
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

export function addSystemConfigValue(key: SystemConfigKey, value: string) {
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

export function removeSystemConfigValue(key: SystemConfigKey, value: string) {
  const nextConfig = getSystemConfig();

  setSystemConfig({
    ...nextConfig,
    [key]: nextConfig[key].filter((entry) => entry !== value),
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
