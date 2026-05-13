export type TeacherCore = {
  id: number;
  name: string;
  department: string;
  subject: string;
  type: string;
  joiningDate: string;
  experience: string;
  academicQualification: string;
  institutionName: string;
  cgpa: string;
  certificateNames: string[];
  appointmentLetterFileName: string;
  appointmentLetterContent: string;
};

export type AttendanceSummary = {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalDays: number;
  attendanceRate: number;
};

export type PerformanceSummary = {
  overallScore: number;
  teaching: number;
  punctuality: number;
  engagement: number;
  professionalism: number;
};

export type SalaryStatement = {
  month: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeMoney: number;
  allowance: number;
  deductions: number;
  advanceDeduction: number;
  netSalary: number;
  bankName: string;
  accountNumber: string;
};

export type OvertimeEntry = {
  date: string;
  hours: number;
  reason: string;
  amount: number;
};

export type TeacherRecord = TeacherCore & {
  employeeId: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  maritalStatus: string;
  nationalId: string;
  attendance: AttendanceSummary;
  performance: PerformanceSummary;
  salary: SalaryStatement;
  overtimeEntries: OvertimeEntry[];
  responsibilities: string[];
  achievements: string[];
  notes: string[];
  promotedDesignation?: string;
  promotedSalary?: number;
};

function cloneTeacherRecord(record: TeacherRecord): TeacherRecord {
  return {
    ...record,
    certificateNames: [...record.certificateNames],
    overtimeEntries: record.overtimeEntries.map((entry) => ({ ...entry })),
    responsibilities: [...record.responsibilities],
    achievements: [...record.achievements],
    notes: [...record.notes],
    attendance: { ...record.attendance },
    performance: { ...record.performance },
    salary: { ...record.salary },
  };
}

export function formatDateLabel(dateValue: string) {
  if (!dateValue) {
    return "-";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildTeacherRecord(core: TeacherCore): TeacherRecord {
  const seed = core.id;
  const overtimeHours = 8 + (seed % 5) * 2;
  const overtimeRate = 24 + (seed % 4) * 4;
  const baseSalary = core.type === "Full-time" ? 52000 + seed * 850 : core.type === "Part-time" ? 32000 + seed * 650 : 28000 + seed * 500;
  const overtimeMoney = overtimeHours * overtimeRate;
  const allowance = 4200 + seed * 240;
  const deductions = 1200 + seed * 140;
  const advanceDeduction = seed % 2 === 0 ? 600 : 0;
  const netSalary = baseSalary + overtimeMoney + allowance - deductions - advanceDeduction;
  const presentDays = 22 - (seed % 3);
  const lateDays = seed % 2;
  const absentDays = seed % 2 === 0 ? 1 : 0;
  const totalDays = 22;
  const attendanceRate = Math.round(((presentDays - lateDays * 0.25) / totalDays) * 100);
  const overallScore = 84 + (seed % 5) * 2;

  return {
    ...core,
    employeeId: `TCH-${String(seed).padStart(4, "0")}`,
    dateOfBirth: `198${seed % 10}-0${(seed % 6) + 1}-1${seed % 8}`,
    gender: seed % 2 === 0 ? "Female" : "Male",
    phone: `+1-555-01${String(seed).padStart(2, "0")}`,
    email: `${core.name.toLowerCase().replace(/\s+/g, ".")}@kpi.edu`,
    address: `${seed * 14} Academic Avenue, ${core.department} District`,
    bloodGroup: ["A+", "B+", "O+", "AB+"][seed % 4],
    emergencyContact: `+1-555-88${String(seed).padStart(2, "0")}`,
    maritalStatus: seed % 3 === 0 ? "Married" : "Single",
    nationalId: `NI-${seed}${seed}${seed}-${String(1000 + seed * 37)}`,
    attendance: {
      presentDays,
      lateDays,
      absentDays,
      totalDays,
      attendanceRate,
    },
    performance: {
      overallScore,
      teaching: overallScore + 1,
      punctuality: overallScore - 2,
      engagement: overallScore,
      professionalism: overallScore + 3,
    },
    salary: {
      month: "May 2026",
      baseSalary,
      overtimeHours,
      overtimeRate,
      overtimeMoney,
      allowance,
      deductions,
      advanceDeduction,
      netSalary,
      bankName: "National Teachers Bank",
      accountNumber: `000-45${String(seed).padStart(2, "0")}-82${seed}`,
    },
    overtimeEntries: [
      {
        date: "2026-05-02",
        hours: Math.max(overtimeHours - 3, 2),
        reason: "Examination supervision",
        amount: Math.max(overtimeHours - 3, 2) * overtimeRate,
      },
      {
        date: "2026-05-11",
        hours: 3,
        reason: "Extra lesson planning",
        amount: 3 * overtimeRate,
      },
      {
        date: "2026-05-18",
        hours: 2,
        reason: "Parent meeting follow-up",
        amount: 2 * overtimeRate,
      },
    ],
    responsibilities: [
      "Deliver classroom instruction and assessment",
      "Prepare lesson plans and learning materials",
      "Support student mentoring and discipline",
      "Maintain attendance and grade records",
    ],
    achievements: [
      `Overall evaluation score ${overallScore}%`,
      "Consistent parent communication record",
      "Contributed to academic improvement plans",
    ],
    notes: [
      "Ready for promotion review in the next cycle",
      "Ensure monthly attendance logs are synced with payroll",
    ],
  };
}

export function createTeacherRecord(core: TeacherCore, existing?: Partial<TeacherRecord>): TeacherRecord {
  return {
    ...buildTeacherRecord(core),
    ...existing,
    ...core,
  };
}

const initialTeacherRecords: TeacherRecord[] = [
  createTeacherRecord({
    id: 1,
    name: "John Smith",
    department: "Mathematics",
    subject: "Algebra, Calculus",
    type: "Full-time",
    joiningDate: "2020-08-15",
    experience: "5 years",
    academicQualification: "MSc in Mathematics",
    institutionName: "KPI University",
    cgpa: "3.78",
    certificateNames: ["MSc Certificate.pdf", "Teaching License.pdf"],
    appointmentLetterFileName: "john-smith-appointment-letter.doc",
    appointmentLetterContent: "",
  }),
  createTeacherRecord({
    id: 2,
    name: "Sarah Johnson",
    department: "Science",
    subject: "Physics, Chemistry",
    type: "Full-time",
    joiningDate: "2019-01-10",
    experience: "7 years",
    academicQualification: "MSc in Physics",
    institutionName: "National Science College",
    cgpa: "3.91",
    certificateNames: ["Degree Certificate.pdf"],
    appointmentLetterFileName: "sarah-johnson-appointment-letter.doc",
    appointmentLetterContent: "",
  }),
  createTeacherRecord({
    id: 3,
    name: "Michael Chen",
    department: "English",
    subject: "Literature, Grammar",
    type: "Part-time",
    joiningDate: "2022-03-20",
    experience: "3 years",
    academicQualification: "MA in English Literature",
    institutionName: "Central Arts College",
    cgpa: "3.64",
    certificateNames: ["MA Certificate.pdf"],
    appointmentLetterFileName: "michael-chen-appointment-letter.doc",
    appointmentLetterContent: "",
  }),
  createTeacherRecord({
    id: 4,
    name: "Emma Williams",
    department: "History",
    subject: "World History",
    type: "Contract",
    joiningDate: "2023-09-01",
    experience: "2 years",
    academicQualification: "BA in History",
    institutionName: "City College",
    cgpa: "3.55",
    certificateNames: ["BA Certificate.pdf"],
    appointmentLetterFileName: "emma-williams-appointment-letter.doc",
    appointmentLetterContent: "",
  }),
];

let teacherStore = initialTeacherRecords;

export function getTeachers() {
  return teacherStore.map(cloneTeacherRecord);
}

export function setTeachers(nextTeachers: TeacherRecord[]) {
  teacherStore = nextTeachers.map(cloneTeacherRecord);
}

export function getTeacherById(teacherId: number) {
  return teacherStore.find((teacher) => teacher.id === teacherId) ?? null;
}