const DEPARTMENT_COLOR_PALETTE = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

function hashDepartmentName(department: string) {
  return department
    .toLowerCase()
    .split("")
    .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);
}

export function getDepartmentColor(department: string, opacity = 1) {
  const baseColor = DEPARTMENT_COLOR_PALETTE[hashDepartmentName(department) % DEPARTMENT_COLOR_PALETTE.length];

  if (opacity >= 1) {
    return baseColor;
  }

  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

  return `${baseColor}${alpha}`;
}
