export type StudentCore = {
  id: number;
  name: string;
  className: string;
  group: string;
  section: string;
  rollNumber: string;
  guardianName: string;
  contactNumber: string;
  biometricId: string;
  admissionDate: string;
};

export type StudentRecord = StudentCore & {
  attendanceRate: number;
  attendanceStatus: "Present" | "Absent" | "Late";
  lastAttendanceSource: "manual" | "biometric";
  lastAttendanceTime: string;
};

export type StudentAttendanceRecord = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  time: string;
  source: "manual" | "biometric";
  status: "Present" | "Absent" | "Late";
  note: string;
};

export type StudentResultRecord = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  group: string;
  section: string;
  examName: string;
  subject: string;
  teacherName: string;
  examDate: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remark: string;
};

type StudentStoreSnapshot = {
  students: StudentRecord[];
  attendance: StudentAttendanceRecord[];
  results: StudentResultRecord[];
};

const STORAGE_KEY = "kpi_student_admin_store";

function cloneStudent(student: StudentRecord): StudentRecord {
  return { ...student };
}

function cloneAttendance(record: StudentAttendanceRecord): StudentAttendanceRecord {
  return { ...record };
}

function cloneResult(record: StudentResultRecord): StudentResultRecord {
  return { ...record };
}

function buildStudent(core: StudentCore, existing?: Partial<StudentRecord>): StudentRecord {
  const attendanceRate = existing?.attendanceRate ?? 96 - (core.id % 4) * 2;
  const attendanceStatus = existing?.attendanceStatus ?? (core.id % 3 === 0 ? "Late" : "Present");

  return {
    ...core,
    attendanceRate,
    attendanceStatus,
    lastAttendanceSource: existing?.lastAttendanceSource ?? (core.id % 2 === 0 ? "biometric" : "manual"),
    lastAttendanceTime: existing?.lastAttendanceTime ?? "08:00",
  };
}

const initialStudents: StudentRecord[] = [
  buildStudent({
    id: 1,
    name: "Ayesha Khan",
    className: "Class 10",
    group: "Science",
    section: "A",
    rollNumber: "10-01",
    guardianName: "Imran Khan",
    contactNumber: "+880 1711 000 101",
    biometricId: "BIO-1001",
    admissionDate: "2023-02-15",
  }),
  buildStudent({
    id: 2,
    name: "Rafiul Islam",
    className: "Class 9",
    group: "Business Studies",
    section: "B",
    rollNumber: "09-08",
    guardianName: "Salma Begum",
    contactNumber: "+880 1711 000 102",
    biometricId: "BIO-1002",
    admissionDate: "2022-11-20",
  }),
  buildStudent({
    id: 3,
    name: "Nusrat Jahan",
    className: "Class 8",
    group: "Arts",
    section: "A",
    rollNumber: "08-14",
    guardianName: "Abdul Karim",
    contactNumber: "+880 1711 000 103",
    biometricId: "BIO-1003",
    admissionDate: "2024-01-08",
  }),
];

const initialAttendance: StudentAttendanceRecord[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "Ayesha Khan",
    className: "Class 10",
    date: "2026-05-30",
    time: "08:02",
    source: "biometric",
    status: "Present",
    note: "Fingerprint scan",
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Rafiul Islam",
    className: "Class 9",
    date: "2026-05-30",
    time: "08:10",
    source: "manual",
    status: "Late",
    note: "Entered by admin after gate check",
  },
];

const initialResults: StudentResultRecord[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "Ayesha Khan",
    className: "Class 10",
    group: "Science",
    section: "A",
    examName: "Mid Term 2026",
    subject: "Mathematics",
    teacherName: "Mr. Rahman",
    examDate: "2026-05-18",
    marksObtained: 88,
    totalMarks: 100,
    grade: "A",
    remark: "Strong problem solving and consistent homework completion.",
  },
  {
    id: 2,
    studentId: 1,
    studentName: "Ayesha Khan",
    className: "Class 10",
    group: "Science",
    section: "A",
    examName: "Mid Term 2026",
    subject: "Physics",
    teacherName: "Ms. Karim",
    examDate: "2026-05-18",
    marksObtained: 91,
    totalMarks: 100,
    grade: "A+",
    remark: "Excellent lab performance and conceptual clarity.",
  },
  {
    id: 3,
    studentId: 2,
    studentName: "Rafiul Islam",
    className: "Class 9",
    group: "Business Studies",
    section: "B",
    examName: "Mid Term 2026",
    subject: "Accounting",
    teacherName: "Mr. Hasan",
    examDate: "2026-05-18",
    marksObtained: 76,
    totalMarks: 100,
    grade: "B+",
    remark: "Good progress with better presentation needed.",
  },
  {
    id: 4,
    studentId: 3,
    studentName: "Nusrat Jahan",
    className: "Class 8",
    group: "Arts",
    section: "A",
    examName: "Quarterly Exam 2026",
    subject: "English",
    teacherName: "Ms. Hossain",
    examDate: "2026-05-16",
    marksObtained: 84,
    totalMarks: 100,
    grade: "A-",
    remark: "Clear writing and good reading comprehension.",
  },
];

let studentStore: StudentStoreSnapshot = {
  students: initialStudents,
  attendance: initialAttendance,
  results: initialResults,
};

function loadStore(): StudentStoreSnapshot {
  if (typeof window === "undefined") {
    return studentStore;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return studentStore;
  }

  try {
    const parsed = JSON.parse(raw) as StudentStoreSnapshot;
    if (!Array.isArray(parsed?.students) || !Array.isArray(parsed?.attendance)) {
      return studentStore;
    }

    studentStore = {
      students: parsed.students.map(cloneStudent),
      attendance: parsed.attendance.map(cloneAttendance),
      results: Array.isArray(parsed?.results) ? parsed.results.map(cloneResult) : initialResults.map(cloneResult),
    };
  } catch {
    return studentStore;
  }

  return studentStore;
}

function saveStore(nextStore: StudentStoreSnapshot) {
  studentStore = {
    students: nextStore.students.map(cloneStudent),
    attendance: nextStore.attendance.map(cloneAttendance),
    results: nextStore.results.map(cloneResult),
  };

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(studentStore));
}

export function getStudents() {
  return loadStore().students.map(cloneStudent);
}

export function getStudentById(studentId: number) {
  return loadStore().students.find((student) => student.id === studentId) ?? null;
}

export function getStudentAttendance() {
  return loadStore().attendance.map(cloneAttendance);
}

export function getStudentResults() {
  return loadStore().results.map(cloneResult);
}

export function addStudent(student: StudentCore) {
  const store = loadStore();
  const nextStudent = buildStudent(student, {
    attendanceRate: 0,
    attendanceStatus: "Absent",
    lastAttendanceSource: "manual",
    lastAttendanceTime: "",
  });

  saveStore({
    students: [nextStudent, ...store.students],
    attendance: store.attendance,
    results: store.results,
  });

  return nextStudent;
}

export function addStudentAttendance(entry: Omit<StudentAttendanceRecord, "id" | "studentName" | "className">) {
  const store = loadStore();
  const student = store.students.find((item) => item.id === entry.studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const nextRecord: StudentAttendanceRecord = {
    id: Date.now(),
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    ...entry,
  };

  const updatedStudents = store.students.map((item) =>
    item.id === student.id
      ? {
          ...item,
          attendanceStatus: entry.status,
          lastAttendanceSource: entry.source,
          lastAttendanceTime: entry.time,
          attendanceRate: entry.status === "Present" ? Math.min(100, item.attendanceRate + 1) : Math.max(0, item.attendanceRate - 1),
        }
      : item,
  );

  saveStore({
    students: updatedStudents,
    attendance: [nextRecord, ...store.attendance],
    results: store.results,
  });

  return nextRecord;
}

function deriveGrade(marksObtained: number, totalMarks: number) {
  const ratio = totalMarks > 0 ? marksObtained / totalMarks : 0;
  if (ratio >= 0.9) return "A+";
  if (ratio >= 0.8) return "A";
  if (ratio >= 0.7) return "B+";
  if (ratio >= 0.6) return "B";
  if (ratio >= 0.5) return "C";
  return "D";
}

export function addStudentResult(entry: Omit<StudentResultRecord, "id" | "studentName" | "className" | "group" | "section" | "grade">) {
  const store = loadStore();
  const student = store.students.find((item) => item.id === entry.studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const nextRecord: StudentResultRecord = {
    id: Date.now(),
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    group: student.group,
    section: student.section,
    grade: deriveGrade(entry.marksObtained, entry.totalMarks),
    ...entry,
  };

  saveStore({
    students: store.students,
    attendance: store.attendance,
    results: [nextRecord, ...store.results],
  });

  return nextRecord;
}
