import { useMemo, useState } from "react";
import {
  AssignmentTurnedIn,
  Badge,
  Download,
  FilterAlt,
  HowToReg,
  LocalAtm,
  QrCode2,
  Refresh,
  Search,
  School,
  UploadFile,
} from "@mui/icons-material";
import {
  addAdmissionApplication,
  approveAdmissionApplication,
  getStudentAdmissions,
  getStudentFeeLedger,
  getStudents,
  promoteStudent,
  rejectAdmissionApplication,
  updateStudentStatus,
  type StudentAdmissionInput,
  type StudentAdmissionRecord,
  type StudentFeeLedgerRecord,
  type StudentRecord,
  type StudentStatus,
} from "../student-data";

const admissionFormTemplate: StudentAdmissionInput = {
  id: Date.now(),
  name: "",
  className: "Class 9",
  group: "Science",
  section: "A",
  rollNumber: "",
  nameBangla: "",
  dateOfBirth: "",
  gender: "",
  religion: "",
  nationality: "Bangladeshi",
  nidOrBirthCertificateNumber: "",
  bloodGroup: "",
  photoUrl: "",
  guardianName: "",
  fatherName: "",
  fatherOccupation: "",
  fatherNid: "",
  fatherMobile: "",
  fatherAnnualIncome: "",
  motherName: "",
  motherOccupation: "",
  motherNid: "",
  motherMobile: "",
  motherAnnualIncome: "",
  localGuardianName: "",
  localGuardianOccupation: "",
  localGuardianNid: "",
  localGuardianMobile: "",
  localGuardianAnnualIncome: "",
  contactNumber: "",
  emergencyContactNumber: "",
  previousInstitution: "",
  previousClass: "",
  passingYear: "",
  boardRoll: "",
  previousGpa: "",
  academicSession: "2026-27",
  yearLevel: "",
  subjectMajor: "",
  subjectMinor: "",
  optionalSubject: "",
  nuRegistrationNumber: "",
  shift: "Morning",
  presentAddress: "",
  permanentAddress: "",
  admissionType: "Fresh",
  studentIdNumber: "",
  status: "Active",
  feePackage: "General Admission Package",
  admissionFeeAmount: 3500,
  cardExpiryYear: "2027",
  biometricId: "",
  admissionDate: new Date().toISOString().slice(0, 10),
};

const classOptions = [
  "Play",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Honours 1st Year",
  "Honours 2nd Year",
  "Degree Pass",
  "Masters Previous",
];

const groupOptions = ["General", "Science", "Commerce", "Arts", "Business Studies"];
const shiftOptions = ["Morning", "Day", "Evening"];
const statusOptions: StudentStatus[] = ["Active", "On Leave", "Transferred Out", "Passed Out", "Dropped", "Expelled"];

function currentSessionLabel() {
  const year = new Date().getFullYear();
  return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
}

function formatDate(dateValue: string) {
  if (!dateValue) {
    return "-";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function advanceClassName(className: string) {
  const classMatch = className.match(/(\d+)/);
  if (!classMatch) {
    return `${className} Next`;
  }

  const nextNumber = Number(classMatch[1]) + 1;
  return className.replace(classMatch[1], String(nextNumber));
}

function nextRollNumber(student: StudentRecord) {
  const sequence = String(student.id + 1).padStart(4, "0");
  const classCode = student.className.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 3).padEnd(3, "0");
  return `${String(new Date().getFullYear()).slice(2)}-${classCode}-${sequence}`;
}

export default function AdmissionsManagement() {
  const [students, setStudents] = useState<StudentRecord[]>(() => getStudents());
  const [applications, setApplications] = useState<StudentAdmissionRecord[]>(() => getStudentAdmissions());
  const [feeLedger, setFeeLedger] = useState<StudentFeeLedgerRecord[]>(() => getStudentFeeLedger());
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(students[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [admissionForm, setAdmissionForm] = useState<StudentAdmissionInput>(admissionFormTemplate);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );

  const summary = useMemo(() => {
    const activeStudents = students.filter((student) => student.status === "Active").length;
    const totalDue = students.reduce((sum, student) => sum + Math.max(student.feeBalance, 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayApplications = applications.filter((item) => item.createdAt.startsWith(today)).length;

    return {
      totalStudents: students.length,
      activeStudents,
      todayApplications,
      totalDue,
    };
  }, [applications, students]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.studentIdNumber.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.guardianName.toLowerCase().includes(query);
      const matchesClass = !classFilter || student.className === classFilter;
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [classFilter, search, statusFilter, students]);

  const admissionStats = useMemo(() => {
    const pending = applications.filter((item) => item.status === "Pending").length;
    const approved = applications.filter((item) => item.status === "Approved").length;
    const rejected = applications.filter((item) => item.status === "Rejected").length;

    return { pending, approved, rejected };
  }, [applications]);

  const ledgerSummary = useMemo(() => {
    const charges = feeLedger.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
    const payments = feeLedger.filter((item) => item.amount < 0).reduce((sum, item) => sum + Math.abs(item.amount), 0);

    return { charges, payments };
  }, [feeLedger]);

  const submitAdmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!admissionForm.name || !admissionForm.className || !admissionForm.guardianName) {
      setMessage("Fill the student name, class, and guardian information before saving the admission.");
      return;
    }

    const nextApplication = addAdmissionApplication(admissionForm);
    const updatedApplications = getStudentAdmissions();
    const updatedStudents = getStudents();
    const updatedLedger = getStudentFeeLedger();

    setApplications(updatedApplications);
    setStudents(updatedStudents);
    setFeeLedger(updatedLedger);
    setSelectedStudentId(updatedStudents[0]?.id ?? null);
    setAdmissionForm({
      ...admissionFormTemplate,
      academicSession: admissionForm.academicSession || currentSessionLabel(),
      admissionDate: new Date().toISOString().slice(0, 10),
    });
    setMessage(`Admission application ${nextApplication.applicantCode} saved and queued for review.`);
  };

  const approveApplication = (applicationId: number) => {
    const result = approveAdmissionApplication(applicationId);
    setApplications(getStudentAdmissions());
    setStudents(getStudents());
    setFeeLedger(getStudentFeeLedger());
    setSelectedStudentId(result.student.id);
    setMessage(`${result.student.name} was approved and added to the active student list.`);
  };

  const rejectApplication = (applicationId: number) => {
    rejectAdmissionApplication(applicationId, "Rejected after admission review");
    setApplications(getStudentAdmissions());
    setMessage("The application was marked as rejected.");
  };

  const changeStudentStatus = (studentId: number, status: StudentStatus) => {
    updateStudentStatus(studentId, status);
    setStudents(getStudents());
    setApplications(getStudentAdmissions());
    setMessage(`Student status updated to ${status}.`);
  };

  const promoteSelectedStudent = () => {
    if (!selectedStudent) {
      setMessage("Select a student before running promotion.");
      return;
    }

    const nextClass = advanceClassName(selectedStudent.className);
    const nextSection = selectedStudent.section === "A" ? "B" : "A";
    const nextRoll = nextRollNumber(selectedStudent);
    promoteStudent(selectedStudent.id, nextClass, nextSection, nextRoll);
    setStudents(getStudents());
    setMessage(`${selectedStudent.name} was moved to ${nextClass} ${nextSection}.`);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-xl">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <School fontSize="small" /> Admissions & Student Registration
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold sm:text-4xl">Student entry, ID generation, fee assignment, and promotion in one workspace.</h1>
              <p className="max-w-3xl text-sm text-slate-200 sm:text-base">
                Use this module to register fresh admissions or transfers, approve online applications, auto-assign the admission fee package,
                generate student IDs, and keep the student registry ready for attendance, fees, and results.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Students</p>
                <p className="mt-2 text-2xl font-semibold">{summary.totalStudents}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Active</p>
                <p className="mt-2 text-2xl font-semibold">{summary.activeStudents}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Today</p>
                <p className="mt-2 text-2xl font-semibold">{summary.todayApplications}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Due</p>
                <p className="mt-2 text-2xl font-semibold">{summary.totalDue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/20 p-3 text-cyan-100">
                <QrCode2 />
              </div>
              <div>
                <p className="text-sm text-cyan-100">Student ID preview</p>
                <h2 className="text-2xl font-bold">{selectedStudent?.studentIdNumber ?? "No student selected"}</h2>
              </div>
            </div>
            {selectedStudent ? (
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p>{selectedStudent.name} • {selectedStudent.className} • {selectedStudent.group}</p>
                <p>Guardian: {selectedStudent.guardianName}</p>
                <p>Admission package: {selectedStudent.feePackage}</p>
                <p>Card expiry year: {selectedStudent.cardExpiryYear || "-"}</p>
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950" onClick={promoteSelectedStudent}>
                <Refresh fontSize="small" /> Promote selected
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-semibold text-white">
                <Download fontSize="small" /> Bulk ID PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900 shadow-sm">{message}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">New admission form</h2>
            <p className="text-sm text-slate-600">Save fresh admissions, transfer students, and college session enrollments from one form.</p>
          </div>

          <form onSubmit={submitAdmission} className="grid gap-4 p-6 sm:grid-cols-2">
            {[
              ["Student name", "name", "Enter English name"],
              ["Bangla name", "nameBangla", "Enter Bangla name"],
              ["Date of birth", "dateOfBirth", ""],
              ["Gender", "gender", "Male / Female / Other"],
              ["Religion", "religion", ""],
              ["Nationality", "nationality", "Bangladeshi"],
              ["NID / Birth certificate", "nidOrBirthCertificateNumber", "Number"],
              ["Blood group", "bloodGroup", "A+, O+, etc."],
              ["Photo URL", "photoUrl", "Image link"],
              ["Father name", "fatherName", ""],
              ["Father occupation", "fatherOccupation", ""],
              ["Father mobile", "fatherMobile", ""],
              ["Mother name", "motherName", ""],
              ["Guardian name", "guardianName", ""],
              ["Guardian mobile", "localGuardianMobile", ""],
              ["Previous institution", "previousInstitution", ""],
              ["Previous class", "previousClass", ""],
              ["Passing year", "passingYear", ""],
              ["Board / Roll", "boardRoll", ""],
              ["Previous GPA", "previousGpa", ""],
              ["Academic session", "academicSession", "2026-27"],
              ["Class", "className", "Class 9"],
              ["Section", "section", "A"],
              ["Group", "group", "Science"],
              ["Shift", "shift", "Morning"],
              ["Year level", "yearLevel", "1st Year"],
              ["Major", "subjectMajor", ""],
              ["Minor", "subjectMinor", ""],
              ["Optional", "optionalSubject", ""],
              ["NU registration", "nuRegistrationNumber", ""],
              ["Present address", "presentAddress", ""],
              ["Permanent address", "permanentAddress", ""],
              ["Emergency contact", "emergencyContactNumber", ""],
              ["Admission fee package", "feePackage", "General Admission Package"],
              ["Admission fee amount", "admissionFeeAmount", "3500"],
              ["Student ID number", "studentIdNumber", "Auto-generated"],
              ["Biometric ID", "biometricId", "BIO-0000"],
            ].map(([label, field, placeholder], index) => {
              const value = admissionForm[field as keyof StudentAdmissionInput];
              const isTextarea = ["presentAddress", "permanentAddress"].includes(field);
              const isSelect = ["className", "group", "shift", "gender"].includes(field);
              const isNumberField = field === "admissionFeeAmount";
              return (
                <label key={String(field)} className={`space-y-2 text-sm font-medium text-slate-700 ${index < 2 ? "sm:col-span-1" : ""} ${["guardianName", "presentAddress", "permanentAddress"].includes(field) ? "sm:col-span-2" : ""}`}>
                  <span>{label}</span>
                  {isTextarea ? (
                    <textarea
                      value={String(value ?? "")}
                      onChange={(event) => setAdmissionForm((current) => ({ ...current, [field]: event.target.value }))}
                      placeholder={placeholder}
                      className="min-h-[88px] w-full rounded-2xl border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  ) : isSelect ? (
                    <select
                      value={String(value ?? "")}
                      onChange={(event) => setAdmissionForm((current) => ({ ...current, [field]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      {(field === "className" ? classOptions : field === "group" ? groupOptions : field === "shift" ? shiftOptions : ["Male", "Female", "Other"]).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field === "dateOfBirth" || field === "admissionDate" ? "date" : isNumberField ? "number" : "text"}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        setAdmissionForm((current) => ({
                          ...current,
                          [field]: isNumberField ? Number(event.target.value) || 0 : event.target.value,
                        }))
                      }
                      placeholder={placeholder}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  )}
                </label>
              );
            })}

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge fontSize="small" /> Admission saves the student, fee package, and card data together.
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                <HowToReg fontSize="small" /> Save Admission
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Admission review queue</h2>
            <p className="text-sm text-slate-600">Approve or reject submitted admission requests and auto-convert them into student records.</p>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{admissionStats.pending}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Approved</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">{admissionStats.approved}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Rejected</p>
              <p className="mt-2 text-2xl font-semibold text-rose-900">{admissionStats.rejected}</p>
            </div>
          </div>
          <div className="space-y-4 px-6 pb-6">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{application.nameEnglish}</h3>
                      <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{application.status}</span>
                    </div>
                    <p className="text-sm text-slate-600">{application.applicantCode} • {application.className} {application.section} • {application.group}</p>
                    <p className="text-xs text-slate-500">Session {application.academicSession} • Submitted {formatDate(application.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => approveApplication(application.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button type="button" onClick={() => rejectApplication(application.id)} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white">
                      Reject
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">Guardian: {application.guardianName} • Fee package: {application.feePackage} • Remarks: {application.remarks}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Student directory and controls</h2>
            <p className="text-sm text-slate-600">Search, filter, update status, and trigger promotions from the same registry used by attendance and results.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600">
              <Search fontSize="small" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-56 outline-none" placeholder="Search students" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600">
              <FilterAlt fontSize="small" />
              <select
                aria-label="Filter students by class"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                className="outline-none"
              >
                <option value="">All classes</option>
                {Array.from(new Set(students.map((student) => student.className))).sort().map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </label>
            <select
              aria-label="Filter students by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | StudentStatus)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">ID / Class</th>
                <th className="px-6 py-3 font-medium">Fee</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.map((student) => (
                <tr key={student.id} className={selectedStudentId === student.id ? "bg-cyan-50/40" : ""}>
                  <td className="px-6 py-4">
                    <button type="button" onClick={() => setSelectedStudentId(student.id)} className="text-left">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.guardianName} • {student.contactNumber}</div>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div>{student.studentIdNumber}</div>
                    <div className="text-xs text-slate-500">{student.className} {student.section} • Roll {student.rollNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div>{student.feePackage}</div>
                    <div className="text-xs text-slate-500">Balance {student.feeBalance.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${student.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSelectedStudentId(student.id)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                        View
                      </button>
                      <button type="button" onClick={() => changeStudentStatus(student.id, "On Leave")} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        On Leave
                      </button>
                      <button type="button" onClick={() => changeStudentStatus(student.id, "Active")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Active
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No students match the current filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Fee ledger snapshot</h2>
            <p className="text-sm text-slate-600">Track charges and payments for the admission workflow and the student fee ledger.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Charges</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{ledgerSummary.charges.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Payments</p>
              <p className="mt-2 text-xl font-semibold text-emerald-900">{ledgerSummary.payments.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Applications</p>
              <p className="mt-2 text-xl font-semibold text-cyan-900">{applications.length}</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-700">Bulk import</p>
              <p className="mt-2 text-xl font-semibold text-violet-900">Template ready</p>
            </div>
          </div>
          <div className="space-y-3 px-6 pb-6">
            {feeLedger.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.title}</p>
                    <p className="text-slate-600">{entry.studentName} • {entry.className} • {entry.category}</p>
                  </div>
                  <div className={`font-semibold ${entry.amount >= 0 ? "text-rose-700" : "text-emerald-700"}`}>
                    {entry.amount >= 0 ? "+" : "-"}{Math.abs(entry.amount).toLocaleString()}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{entry.note} • Receipt {entry.receiptNumber} • Balance after {entry.balanceAfter.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Operational shortcuts</h2>
            <p className="text-sm text-slate-600">The remaining admission-season workflows are surfaced here so they can be connected next.</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <UploadFile className="text-cyan-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Bulk Excel import</h3>
                  <p className="text-sm text-slate-600">Validate, preview, and import migration data.</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Use a standard template to ingest paper-record migration batches and existing student registers.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <LocalAtm className="text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Online admission form</h3>
                  <p className="text-sm text-slate-600">Public URL for applicants and parent self-service.</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Front-office staff can review submitted applications here before approval or rejection.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <AssignmentTurnedIn className="text-violet-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Merit list</h3>
                  <p className="text-sm text-slate-600">Rank applicants by GPA or marks.</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Auto-notify selected students once admissions are finalized.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Badge className="text-amber-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">ID card designer</h3>
                  <p className="text-sm text-slate-600">Card layout, logo, colors, QR / barcode, and expiry year.</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">This view already exposes the student ID payload needed for bulk printing and scanner lookup.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
