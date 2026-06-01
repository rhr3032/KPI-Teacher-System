export type StudentCore = {
  id: number;
  name: string;
  className: string;
  group: string;
  section: string;
  rollNumber: string;
};

export type StudentStatus = "Active" | "On Leave" | "Transferred Out" | "Passed Out" | "Dropped" | "Expelled";

export type StudentAdmissionType = "Fresh" | "Migration";

export type StudentFeeLedgerCategory = "Admission" | "Tuition" | "Exam" | "Fine" | "Discount" | "Other";

export type StudentAdmissionInput = StudentCore & {
  nameBangla?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  nationality?: string;
  nidOrBirthCertificateNumber?: string;
  bloodGroup?: string;
  photoUrl?: string;
  guardianName?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherNid?: string;
  fatherMobile?: string;
  fatherAnnualIncome?: string;
  motherName?: string;
  motherOccupation?: string;
  motherNid?: string;
  motherMobile?: string;
  motherAnnualIncome?: string;
  localGuardianName?: string;
  localGuardianOccupation?: string;
  localGuardianNid?: string;
  localGuardianMobile?: string;
  localGuardianAnnualIncome?: string;
  contactNumber?: string;
  emergencyContactNumber?: string;
  previousInstitution?: string;
  previousClass?: string;
  passingYear?: string;
  boardRoll?: string;
  previousGpa?: string;
  academicSession?: string;
  yearLevel?: string;
  subjectMajor?: string;
  subjectMinor?: string;
  optionalSubject?: string;
  nuRegistrationNumber?: string;
  shift?: string;
  presentAddress?: string;
  permanentAddress?: string;
  admissionType?: StudentAdmissionType;
  studentIdNumber?: string;
  status?: StudentStatus;
  feePackage?: string;
  admissionFeeAmount?: number;
  cardExpiryYear?: string;
  biometricId?: string;
  admissionDate?: string;
};

export type StudentRecord = StudentCore & {
  nameBangla: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  nationality: string;
  nidOrBirthCertificateNumber: string;
  bloodGroup: string;
  photoUrl: string;
  guardianName: string;
  fatherName: string;
  fatherOccupation: string;
  fatherNid: string;
  fatherMobile: string;
  fatherAnnualIncome: string;
  motherName: string;
  motherOccupation: string;
  motherNid: string;
  motherMobile: string;
  motherAnnualIncome: string;
  localGuardianName: string;
  localGuardianOccupation: string;
  localGuardianNid: string;
  localGuardianMobile: string;
  localGuardianAnnualIncome: string;
  contactNumber: string;
  emergencyContactNumber: string;
  previousInstitution: string;
  previousClass: string;
  passingYear: string;
  boardRoll: string;
  previousGpa: string;
  academicSession: string;
  yearLevel: string;
  subjectMajor: string;
  subjectMinor: string;
  optionalSubject: string;
  nuRegistrationNumber: string;
  shift: string;
  presentAddress: string;
  permanentAddress: string;
  admissionType: StudentAdmissionType;
  studentIdNumber: string;
  status: StudentStatus;
  feePackage: string;
  admissionFeeAmount: number;
  feeBalance: number;
  cardExpiryYear: string;
  biometricId: string;
  admissionDate: string;
  attendanceRate: number;
  attendanceStatus: "Present" | "Absent" | "Late";
  lastAttendanceSource: "manual" | "biometric";
  lastAttendanceTime: string;
};

export type StudentAdmissionRecord = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  group: string;
  section: string;
  admissionType: StudentAdmissionType;
  academicSession: string;
  yearLevel: string;
  shift: string;
  studentIdNumber: string;
  feePackage: string;
  admissionFeeAmount: number;
  status: StudentStatus;
  createdAt: string;
};

export type StudentFeeLedgerRecord = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  ledgerDate: string;
  category: StudentFeeLedgerCategory;
  title: string;
  amount: number;
  balanceAfter: number;
  note: string;
  receiptNumber: string;
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
  admissions: StudentAdmissionRecord[];
  feeLedger: StudentFeeLedgerRecord[];
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

function cloneAdmission(record: StudentAdmissionRecord): StudentAdmissionRecord {
  return { ...record };
}

function cloneFeeLedger(record: StudentFeeLedgerRecord): StudentFeeLedgerRecord {
  return { ...record };
}

function currentYearFromDate(dateValue: string) {
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? new Date().getFullYear() : parsed.getFullYear();
}

function deriveSessionLabel(dateValue: string) {
  const year = currentYearFromDate(dateValue);
  return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
}

function createClassCode(className: string) {
  return className
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 3)
    .padEnd(3, "0");
}

function createStudentIdNumber(className: string, academicSession: string, studentId: number) {
  return `${String(academicSession).slice(0, 4)}-${createClassCode(className)}-${String(studentId).padStart(4, "0")}`;
}

function normalizeAddress(address: string | undefined) {
  return address?.trim() || "Not provided";
}

function normalizeStudent(student: StudentAdmissionInput, existing?: Partial<StudentRecord>): StudentRecord {
  const admissionDate = student.admissionDate?.trim() || existing?.admissionDate || new Date().toISOString().slice(0, 10);
  const academicSession = student.academicSession?.trim() || existing?.academicSession || deriveSessionLabel(admissionDate);
  const studentIdNumber = student.studentIdNumber?.trim() || existing?.studentIdNumber || createStudentIdNumber(student.className, academicSession, student.id);
  const status = student.status || existing?.status || "Active";
  const feePackage = student.feePackage?.trim() || existing?.feePackage || `${student.className} ${student.group} Admission`;
  const admissionFeeAmount = typeof student.admissionFeeAmount === "number" ? student.admissionFeeAmount : existing?.admissionFeeAmount ?? 1500;
  const feeBalance = existing?.feeBalance ?? admissionFeeAmount;

  return {
    id: student.id,
    name: student.name.trim(),
    className: student.className.trim(),
    group: student.group.trim(),
    section: student.section.trim(),
    rollNumber: student.rollNumber.trim(),
    nameBangla: student.nameBangla?.trim() || existing?.nameBangla || student.name.trim(),
    dateOfBirth: student.dateOfBirth?.trim() || existing?.dateOfBirth || "",
    gender: student.gender?.trim() || existing?.gender || "",
    religion: student.religion?.trim() || existing?.religion || "",
    nationality: student.nationality?.trim() || existing?.nationality || "Bangladeshi",
    nidOrBirthCertificateNumber: student.nidOrBirthCertificateNumber?.trim() || existing?.nidOrBirthCertificateNumber || "",
    bloodGroup: student.bloodGroup?.trim() || existing?.bloodGroup || "",
    photoUrl: student.photoUrl?.trim() || existing?.photoUrl || "",
    guardianName: student.guardianName?.trim() || existing?.guardianName || "",
    fatherName: student.fatherName?.trim() || existing?.fatherName || student.guardianName?.trim() || existing?.guardianName || "",
    fatherOccupation: student.fatherOccupation?.trim() || existing?.fatherOccupation || "",
    fatherNid: student.fatherNid?.trim() || existing?.fatherNid || "",
    fatherMobile: student.fatherMobile?.trim() || existing?.fatherMobile || student.contactNumber?.trim() || existing?.contactNumber || "",
    fatherAnnualIncome: student.fatherAnnualIncome?.trim() || existing?.fatherAnnualIncome || "",
    motherName: student.motherName?.trim() || existing?.motherName || "",
    motherOccupation: student.motherOccupation?.trim() || existing?.motherOccupation || "",
    motherNid: student.motherNid?.trim() || existing?.motherNid || "",
    motherMobile: student.motherMobile?.trim() || existing?.motherMobile || "",
    motherAnnualIncome: student.motherAnnualIncome?.trim() || existing?.motherAnnualIncome || "",
    localGuardianName: student.localGuardianName?.trim() || existing?.localGuardianName || "",
    localGuardianOccupation: student.localGuardianOccupation?.trim() || existing?.localGuardianOccupation || "",
    localGuardianNid: student.localGuardianNid?.trim() || existing?.localGuardianNid || "",
    localGuardianMobile: student.localGuardianMobile?.trim() || existing?.localGuardianMobile || "",
    localGuardianAnnualIncome: student.localGuardianAnnualIncome?.trim() || existing?.localGuardianAnnualIncome || "",
    contactNumber: student.contactNumber?.trim() || existing?.contactNumber || student.fatherMobile?.trim() || existing?.fatherMobile || "",
    emergencyContactNumber: student.emergencyContactNumber?.trim() || existing?.emergencyContactNumber || student.contactNumber?.trim() || existing?.contactNumber || "",
    previousInstitution: student.previousInstitution?.trim() || existing?.previousInstitution || "",
    previousClass: student.previousClass?.trim() || existing?.previousClass || "",
    passingYear: student.passingYear?.trim() || existing?.passingYear || "",
    boardRoll: student.boardRoll?.trim() || existing?.boardRoll || "",
    previousGpa: student.previousGpa?.trim() || existing?.previousGpa || "",
    academicSession,
    yearLevel: student.yearLevel?.trim() || existing?.yearLevel || "",
    subjectMajor: student.subjectMajor?.trim() || existing?.subjectMajor || "",
    subjectMinor: student.subjectMinor?.trim() || existing?.subjectMinor || "",
    optionalSubject: student.optionalSubject?.trim() || existing?.optionalSubject || "",
    nuRegistrationNumber: student.nuRegistrationNumber?.trim() || existing?.nuRegistrationNumber || "",
    shift: student.shift?.trim() || existing?.shift || "Day",
    presentAddress: normalizeAddress(student.presentAddress || existing?.presentAddress),
    permanentAddress: normalizeAddress(student.permanentAddress || existing?.permanentAddress),
    admissionType: student.admissionType || existing?.admissionType || "Fresh",
    studentIdNumber,
    status,
    feePackage,
    admissionFeeAmount,
    feeBalance,
    cardExpiryYear: student.cardExpiryYear?.trim() || existing?.cardExpiryYear || String(currentYearFromDate(admissionDate)),
    biometricId: student.biometricId?.trim() || existing?.biometricId || `BIO-${String(student.id).padStart(4, "0")}`,
    admissionDate,
    attendanceRate: existing?.attendanceRate ?? 96 - (student.id % 4) * 2,
    attendanceStatus: existing?.attendanceStatus ?? (student.id % 3 === 0 ? "Late" : "Present"),
    lastAttendanceSource: existing?.lastAttendanceSource ?? (student.id % 2 === 0 ? "biometric" : "manual"),
    lastAttendanceTime: existing?.lastAttendanceTime ?? "08:00",
  };
}

function createAdmissionRecord(student: StudentRecord): StudentAdmissionRecord {
  return {
    id: Date.now() + student.id,
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    group: student.group,
    section: student.section,
    admissionType: student.admissionType,
    academicSession: student.academicSession,
    yearLevel: student.yearLevel,
    shift: student.shift,
    studentIdNumber: student.studentIdNumber,
    feePackage: student.feePackage,
    admissionFeeAmount: student.admissionFeeAmount,
    status: student.status,
    createdAt: student.admissionDate,
  };
}

function createFeeLedgerRecord(student: StudentRecord, amount: number, category: StudentFeeLedgerCategory, title: string, note: string) {
  return {
    id: Date.now() + student.id + Math.round(amount),
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    ledgerDate: student.admissionDate,
    category,
    title,
    amount,
    balanceAfter: amount,
    note,
    receiptNumber: `RC-${String(student.id).padStart(4, "0")}-${String(Date.now()).slice(-4)}`,
  } satisfies StudentFeeLedgerRecord;
}

function buildStudent(core: StudentCore, existing?: Partial<StudentRecord>): StudentRecord {
  return normalizeStudent(core, existing);
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
    nameBangla: "আয়েশা খান",
    dateOfBirth: "2008-03-12",
    gender: "Female",
    religion: "Islam",
    nationality: "Bangladeshi",
    nidOrBirthCertificateNumber: "BC-10001",
    bloodGroup: "A+",
    fatherName: "Imran Khan",
    fatherOccupation: "Business",
    fatherMobile: "+880 1711 000 101",
    fatherAnnualIncome: "480000",
    motherName: "Salma Khan",
    motherOccupation: "Teacher",
    motherMobile: "+880 1711 000 102",
    localGuardianName: "Imran Khan",
    localGuardianMobile: "+880 1711 000 101",
    previousInstitution: "KPI Model School",
    previousClass: "Class 9",
    passingYear: "2022",
    boardRoll: "778812",
    previousGpa: "4.90",
    academicSession: "2023-24",
    yearLevel: "10",
    subjectMajor: "Science",
    shift: "Morning",
    presentAddress: "Kushtia Sadar, Kushtia",
    permanentAddress: "Kushtia Sadar, Kushtia",
    studentIdNumber: "2023-C10-0001",
    status: "Active",
    feePackage: "Science Day Package",
    admissionFeeAmount: 2500,
    cardExpiryYear: "2024",
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
    nameBangla: "রাফিউল ইসলাম",
    dateOfBirth: "2009-08-20",
    gender: "Male",
    religion: "Islam",
    nationality: "Bangladeshi",
    nidOrBirthCertificateNumber: "BC-10002",
    bloodGroup: "B+",
    fatherName: "Abdur Rahman",
    fatherOccupation: "Shopkeeper",
    fatherMobile: "+880 1711 000 102",
    motherName: "Salma Begum",
    motherOccupation: "Homemaker",
    localGuardianName: "Salma Begum",
    previousInstitution: "KPI Junior School",
    previousClass: "Class 8",
    passingYear: "2021",
    boardRoll: "677811",
    previousGpa: "4.70",
    academicSession: "2022-23",
    yearLevel: "9",
    subjectMajor: "Business Studies",
    shift: "Day",
    presentAddress: "Mirpur, Dhaka",
    permanentAddress: "Mirpur, Dhaka",
    studentIdNumber: "2022-C09-0008",
    status: "Active",
    feePackage: "Commerce Day Package",
    admissionFeeAmount: 2200,
    cardExpiryYear: "2023",
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
    nameBangla: "নুসরাত জাহান",
    dateOfBirth: "2010-01-15",
    gender: "Female",
    religion: "Islam",
    nationality: "Bangladeshi",
    nidOrBirthCertificateNumber: "BC-10003",
    bloodGroup: "O+",
    fatherName: "Abdul Karim",
    fatherOccupation: "Farmer",
    fatherMobile: "+880 1711 000 103",
    motherName: "Maliha Akter",
    motherOccupation: "Nurse",
    localGuardianName: "Abdul Karim",
    previousInstitution: "KPI Foundation School",
    previousClass: "Class 7",
    passingYear: "2023",
    boardRoll: "556644",
    previousGpa: "4.85",
    academicSession: "2024-25",
    yearLevel: "8",
    subjectMajor: "General",
    shift: "Morning",
    presentAddress: "Kushtia Sadar, Kushtia",
    permanentAddress: "Kushtia Sadar, Kushtia",
    studentIdNumber: "2024-C08-0014",
    status: "Active",
    feePackage: "General Morning Package",
    admissionFeeAmount: 2000,
    cardExpiryYear: "2025",
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

const initialAdmissions: StudentAdmissionRecord[] = initialStudents.map((student) => createAdmissionRecord(student));

const initialFeeLedger: StudentFeeLedgerRecord[] = initialStudents.map((student) =>
  createFeeLedgerRecord(
    student,
    student.admissionFeeAmount,
    "Admission",
    `${student.feePackage} admission fee`,
    "Auto-assigned during admission",
  ),
);

let studentStore: StudentStoreSnapshot = {
  students: initialStudents,
  attendance: initialAttendance,
  results: initialResults,
  admissions: initialAdmissions,
  feeLedger: initialFeeLedger,
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
      students: parsed.students.map((student) => normalizeStudent(student as StudentAdmissionInput, student)),
      attendance: parsed.attendance.map(cloneAttendance),
      results: Array.isArray(parsed?.results) ? parsed.results.map(cloneResult) : initialResults.map(cloneResult),
      admissions: Array.isArray(parsed?.admissions) ? parsed.admissions.map(cloneAdmission) : initialAdmissions.map(cloneAdmission),
      feeLedger: Array.isArray(parsed?.feeLedger) ? parsed.feeLedger.map(cloneFeeLedger) : initialFeeLedger.map(cloneFeeLedger),
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
    admissions: nextStore.admissions.map(cloneAdmission),
    feeLedger: nextStore.feeLedger.map(cloneFeeLedger),
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

export function getStudentAdmissions() {
  return loadStore().admissions.map(cloneAdmission);
}

export function getStudentFeeLedger() {
  return loadStore().feeLedger.map(cloneFeeLedger);
}

export function addAdmissionApplication(application: StudentAdmissionInput) {
  const store = loadStore();
  const studentId = application.id || Date.now();
  const studentName = application.name?.trim() || application.nameBangla?.trim() || "Unnamed Student";
  const admissionDate = application.admissionDate?.trim() || new Date().toISOString().slice(0, 10);
  const academicSession = application.academicSession?.trim() || deriveSessionLabel(admissionDate);
  const studentIdNumber = application.studentIdNumber?.trim() || createStudentIdNumber(application.className, academicSession, studentId);
  const feePackage = application.feePackage?.trim() || `${application.className} ${application.group} Admission`;
  const admissionFeeAmount = typeof application.admissionFeeAmount === "number" ? application.admissionFeeAmount : 1500;

  const nextApplication: StudentAdmissionRecord = {
    id: Date.now(),
    studentId,
    studentName,
    className: application.className,
    group: application.group,
    section: application.section,
    admissionType: application.admissionType || "Fresh",
    academicSession,
    yearLevel: application.yearLevel?.trim() || "",
    shift: application.shift?.trim() || "Day",
    studentIdNumber,
    feePackage,
    admissionFeeAmount,
    status: application.status || "Active",
    createdAt: admissionDate,
  };

  saveStore({
    students: store.students,
    attendance: store.attendance,
    results: store.results,
    admissions: [nextApplication, ...store.admissions],
    feeLedger: store.feeLedger,
  });

  return nextApplication;
}

export function approveAdmissionApplication(applicationId: number) {
  const store = loadStore();
  const application = store.admissions.find((item) => item.id === applicationId);

  if (!application) {
    throw new Error("Admission application not found");
  }

  const nextStudent = addStudent({
    id: application.studentId || Date.now(),
    name: application.studentName,
    className: application.className,
    group: application.group,
    section: application.section,
    rollNumber: `${application.className.replace(/\s+/g, "")}-${String(store.students.length + 1).padStart(2, "0")}`,
    guardianName: application.studentName,
    contactNumber: "",
    biometricId: `BIO-${String(store.students.length + 1).padStart(4, "0")}`,
    admissionDate: application.createdAt.slice(0, 10),
    academicSession: application.academicSession,
    yearLevel: application.yearLevel,
    shift: application.shift,
    studentIdNumber: application.studentIdNumber,
    feePackage: application.feePackage,
    admissionFeeAmount: application.admissionFeeAmount,
    admissionType: application.admissionType,
    status: application.status,
  });

  const updatedAdmissions = store.admissions.map((item) =>
    item.id === applicationId
      ? {
          ...item,
          studentId: nextStudent.id,
          status: "Active" as StudentStatus,
        }
      : item,
  );

  saveStore({
    students: store.students.map((student) =>
      student.id === nextStudent.id
        ? {
            ...student,
            nameBangla: application.studentName,
            academicSession: application.academicSession,
            yearLevel: application.yearLevel,
            shift: application.shift,
            admissionType: application.admissionType,
            studentIdNumber: application.studentIdNumber,
            feePackage: application.feePackage,
            admissionFeeAmount: application.admissionFeeAmount,
            feeBalance: application.admissionFeeAmount,
            admissionDate: application.createdAt.slice(0, 10),
          }
        : student,
    ),
    attendance: store.attendance,
    results: store.results,
    admissions: updatedAdmissions,
    feeLedger: store.feeLedger,
  });

  return { application: { ...application, status: "Active" as StudentStatus, studentId: nextStudent.id }, student: nextStudent };
}

export function rejectAdmissionApplication(applicationId: number, remarks = "Rejected after review") {
  const store = loadStore();
  const updatedAdmissions = store.admissions.map((item) =>
    item.id === applicationId
      ? {
          ...item,
          status: "Dropped" as StudentStatus,
        }
      : item,
  );

  saveStore({
    students: store.students,
    attendance: store.attendance,
    results: store.results,
    admissions: updatedAdmissions,
    feeLedger: store.feeLedger,
  });

  return { applicationId, remarks };
}

export function getStudentSummary() {
  const store = loadStore();
  const activeCount = store.students.filter((student) => student.status === "Active").length;
  const outstandingFees = store.students.reduce((sum, student) => sum + Math.max(student.feeBalance, 0), 0);

  return {
    totalStudents: store.students.length,
    activeStudents: activeCount,
    admissionsToday: store.admissions.filter((admission) => admission.createdAt === new Date().toISOString().slice(0, 10)).length,
    outstandingFees,
  };
}

export function addStudent(student: StudentAdmissionInput) {
  const store = loadStore();
  const nextStudent = buildStudent(student, {
    attendanceRate: 0,
    attendanceStatus: "Absent",
    lastAttendanceSource: "manual",
    lastAttendanceTime: "",
  });
  const admissionRecord = createAdmissionRecord(nextStudent);
  const feeLedgerRecord = createFeeLedgerRecord(
    nextStudent,
    nextStudent.admissionFeeAmount,
    "Admission",
    `${nextStudent.feePackage} admission fee`,
    "Auto-assigned when admission is saved",
  );

  saveStore({
    students: [nextStudent, ...store.students],
    attendance: store.attendance,
    results: store.results,
    admissions: [admissionRecord, ...store.admissions],
    feeLedger: [feeLedgerRecord, ...store.feeLedger],
  });

  return nextStudent;
}

export function updateStudentStatus(studentId: number, status: StudentStatus) {
  const store = loadStore();
  const updatedStudents = store.students.map((student) =>
    student.id === studentId
      ? {
          ...student,
          status,
        }
      : student,
  );

  const updatedAdmissions = store.admissions.map((admission) =>
    admission.studentId === studentId
      ? {
          ...admission,
          status,
        }
      : admission,
  );

  saveStore({
    students: updatedStudents,
    attendance: store.attendance,
    results: store.results,
    admissions: updatedAdmissions,
    feeLedger: store.feeLedger,
  });
}

export function promoteStudent(studentId: number, nextClassName: string, nextSection: string, nextRollNumber: string) {
  const store = loadStore();
  const today = new Date().toISOString().slice(0, 10);

  const updatedStudents = store.students.map((student) =>
    student.id === studentId
      ? {
          ...student,
          className: nextClassName,
          section: nextSection,
          rollNumber: nextRollNumber,
          academicSession: deriveSessionLabel(today),
          status: "Active" as StudentStatus,
        }
      : student,
  );

  saveStore({
    students: updatedStudents,
    attendance: store.attendance,
    results: store.results,
    admissions: store.admissions,
    feeLedger: store.feeLedger,
  });
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
    admissions: store.admissions,
    feeLedger: store.feeLedger,
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
    admissions: store.admissions,
    feeLedger: store.feeLedger,
  });

  return nextRecord;
}
