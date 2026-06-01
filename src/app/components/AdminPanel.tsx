import { useMemo, useState } from "react";
import { AddCircle, Badge, CalendarMonth, Fingerprint, Groups, Search } from "@mui/icons-material";
import {
  addStudent,
  addStudentAttendance,
  getStudentResults,
  getStudentAttendance,
  getStudents,
  type StudentAttendanceRecord,
  type StudentResultRecord,
  type StudentRecord,
} from "../student-data";

function formatDate(dateValue: string) {
  if (!dateValue) {
    return "-";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function AdminPanel() {
  const [students, setStudents] = useState<StudentRecord[]>(() => getStudents());
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>(() => getStudentAttendance());
  const [results, setResults] = useState<StudentResultRecord[]>(() => getStudentResults());
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "biometric" | "manual">("all");
  const [selectedResultStudentId, setSelectedResultStudentId] = useState<number | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    className: "",
    group: "",
    section: "",
    rollNumber: "",
    guardianName: "",
    contactNumber: "",
    biometricId: "",
    admissionDate: "",
  });
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: "",
    date: new Date().toISOString().slice(0, 10),
    time: currentTime(),
    source: "biometric" as "biometric" | "manual",
    status: "Present" as "Present" | "Absent" | "Late",
    note: "",
  });
  const [message, setMessage] = useState("");

  const classOptions = useMemo(() => [...new Set(students.map((student) => student.className))].sort(), [students]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.biometricId.toLowerCase().includes(query) ||
        student.guardianName.toLowerCase().includes(query);
      const matchesClass = !classFilter || student.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [classFilter, studentSearch, students]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => attendanceFilter === "all" || record.source === attendanceFilter);
  }, [attendance, attendanceFilter]);

  const selectedResultStudent = useMemo(
    () => students.find((student) => student.id === selectedResultStudentId) ?? null,
    [selectedResultStudentId, students],
  );

  const selectedResultRecords = useMemo(
    () => results.filter((record) => record.studentId === selectedResultStudentId),
    [results, selectedResultStudentId],
  );

  const selectedResultGroups = useMemo(() => {
    const grouped = selectedResultRecords.reduce<Record<string, StudentResultRecord[]>>((acc, record) => {
      if (!acc[record.examName]) {
        acc[record.examName] = [];
      }
      acc[record.examName].push(record);
      return acc;
    }, {});

    return Object.entries(grouped).map(([examName, examRecords]) => ({
      examName,
      examRecords,
      totalObtained: examRecords.reduce((sum, record) => sum + record.marksObtained, 0),
      totalMarks: examRecords.reduce((sum, record) => sum + record.totalMarks, 0),
    }));
  }, [selectedResultRecords]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayAttendance = attendance.filter((record) => record.date === today);
    return {
      totalStudents: students.length,
      presentToday: todayAttendance.filter((record) => record.status === "Present").length,
      biometricLogs: attendance.filter((record) => record.source === "biometric").length,
      manualLogs: attendance.filter((record) => record.source === "manual").length,
    };
  }, [attendance, students.length]);

  const handleStudentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentForm.name || !studentForm.className || !studentForm.rollNumber) {
      setMessage("Fill in the student name, class, and roll number.");
      return;
    }

    const nextStudent = addStudent({
      id: Date.now(),
      ...studentForm,
    });

    setStudents(getStudents());
    setResults(getStudentResults());
    setStudentForm({
      name: "",
      className: "",
      group: "",
      section: "",
      rollNumber: "",
      guardianName: "",
      contactNumber: "",
      biometricId: "",
      admissionDate: "",
    });
    setAttendanceForm((current) => ({ ...current, studentId: String(nextStudent.id) }));
    setMessage(`Added ${nextStudent.name} to the student list.`);
  };

  const handleAttendanceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!attendanceForm.studentId) {
      setMessage("Choose a student before saving attendance.");
      return;
    }

    const studentId = Number(attendanceForm.studentId);
    const selectedStudent = students.find((student) => student.id === studentId);
    if (!selectedStudent) {
      setMessage("The selected student could not be found.");
      return;
    }

    addStudentAttendance({
      studentId,
      date: attendanceForm.date,
      time: attendanceForm.time,
      source: attendanceForm.source,
      status: attendanceForm.status,
      note: attendanceForm.note || `${attendanceForm.source === "biometric" ? "Biometric" : "Manual"} entry`,
    });

    setStudents(getStudents());
    setAttendance(getStudentAttendance());
    setResults(getStudentResults());
    setAttendanceForm((current) => ({
      ...current,
      time: currentTime(),
      note: "",
    }));
    setMessage(`Recorded ${attendanceForm.source} attendance for ${selectedStudent.name}.`);
  };

  const markQuickAttendance = (student: StudentRecord, source: "biometric" | "manual") => {
    addStudentAttendance({
      studentId: student.id,
      date: new Date().toISOString().slice(0, 10),
      time: currentTime(),
      source,
      status: "Present",
      note: `${source === "biometric" ? "Biometric" : "Manual"} quick mark`,
    });

    setStudents(getStudents());
    setAttendance(getStudentAttendance());
    setResults(getStudentResults());
    setMessage(`Marked ${student.name} as present using ${source}.`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <Badge fontSize="small" /> Admin Panel
            </span>
            <h2 className="text-3xl font-bold">Student administration and attendance</h2>
            <p className="max-w-2xl text-sm text-slate-200">
              Manage the student list, add new records, and capture attendance through biometric or manual entry from one screen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[40rem]">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-200">Students</p>
              <p className="mt-1 text-2xl font-semibold">{stats.totalStudents}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-200">Present Today</p>
              <p className="mt-1 text-2xl font-semibold">{stats.presentToday}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-200">Biometric</p>
              <p className="mt-1 text-2xl font-semibold">{stats.biometricLogs}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-200">Manual</p>
              <p className="mt-1 text-2xl font-semibold">{stats.manualLogs}</p>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Add Student</h3>
            <p className="text-sm text-slate-600">Create a new student profile for the admin directory.</p>
          </div>

          <form onSubmit={handleStudentSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Student Name</span>
              <input
                value={studentForm.name}
                onChange={(event) => setStudentForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter student name"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Class</span>
              <input
                value={studentForm.className}
                onChange={(event) => setStudentForm((current) => ({ ...current, className: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Class 10"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Group</span>
              <input
                value={studentForm.group}
                onChange={(event) => setStudentForm((current) => ({ ...current, group: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Science"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Section</span>
              <input
                value={studentForm.section}
                onChange={(event) => setStudentForm((current) => ({ ...current, section: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="A"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Roll Number</span>
              <input
                value={studentForm.rollNumber}
                onChange={(event) => setStudentForm((current) => ({ ...current, rollNumber: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="10-01"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Guardian Name</span>
              <input
                value={studentForm.guardianName}
                onChange={(event) => setStudentForm((current) => ({ ...current, guardianName: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Parent / Guardian"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Contact Number</span>
              <input
                value={studentForm.contactNumber}
                onChange={(event) => setStudentForm((current) => ({ ...current, contactNumber: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Phone number"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Biometric ID</span>
              <input
                value={studentForm.biometricId}
                onChange={(event) => setStudentForm((current) => ({ ...current, biometricId: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="BIO-1004"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Admission Date</span>
              <input
                type="date"
                value={studentForm.admissionDate}
                onChange={(event) => setStudentForm((current) => ({ ...current, admissionDate: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <AddCircle fontSize="small" />
                Add Student
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Record Attendance</h3>
            <p className="text-sm text-slate-600">Save attendance through biometric capture or manual entry.</p>
          </div>

          <form onSubmit={handleAttendanceSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Student</span>
              <select
                value={attendanceForm.studentId}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, studentId: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.className} {student.section}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Date</span>
              <input
                type="date"
                value={attendanceForm.date}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Time</span>
              <input
                type="time"
                value={attendanceForm.time}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, time: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Method</span>
              <select
                value={attendanceForm.source}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, source: event.target.value as "biometric" | "manual" }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="biometric">Biometric</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Status</span>
              <select
                value={attendanceForm.status}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, status: event.target.value as "Present" | "Absent" | "Late" }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Note</span>
              <textarea
                value={attendanceForm.note}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, note: event.target.value }))}
                className="min-h-[88px] w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Optional attendance note"
              />
            </label>

            <div className="sm:col-span-2 flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Fingerprint fontSize="small" />
                Biometric and manual records are stored together for quick review.
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CalendarMonth fontSize="small" />
                Save Attendance
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Student List</h3>
            <p className="text-sm text-slate-600">View registered students and mark attendance directly from the list.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600">
              <Search fontSize="small" />
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                className="w-56 outline-none"
                placeholder="Search students"
              />
            </label>
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              aria-label="Filter students by class"
              title="Filter students by class"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All classes</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Class</th>
                <th className="px-6 py-3 font-medium">Group</th>
                <th className="px-6 py-3 font-medium">Section</th>
                <th className="px-6 py-3 font-medium">Roll</th>
                <th className="px-6 py-3 font-medium">Biometric ID</th>
                <th className="px-6 py-3 font-medium">Attendance</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="align-top hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.guardianName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {student.className}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{student.group}</td>
                  <td className="px-6 py-4 text-slate-700">{student.section}</td>
                  <td className="px-6 py-4 text-slate-700">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-slate-700">{student.biometricId}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          student.attendanceStatus === "Present"
                            ? "bg-emerald-100 text-emerald-700"
                            : student.attendanceStatus === "Late"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {student.attendanceStatus}
                      </span>
                      <p className="text-xs text-slate-500">
                        {student.attendanceRate}% • Last {student.lastAttendanceSource} at {student.lastAttendanceTime || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => markQuickAttendance(student, "biometric")}
                        className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                      >
                        Biometric
                      </button>
                      <button
                        type="button"
                        onClick={() => markQuickAttendance(student, "manual")}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedResultStudentId(student.id)}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        View Result
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                    No students match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>

        {selectedResultStudent ? (
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Result Sheet</h3>
                <p className="text-sm text-slate-600">Exam and subject-wise marks for the selected student.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResultStudentId(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Close Sheet
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-base font-semibold text-slate-900">{selectedResultStudent.name}</p>
                <p>
                  {selectedResultStudent.className} {selectedResultStudent.group} {selectedResultStudent.section}
                </p>
                <p>
                  Roll {selectedResultStudent.rollNumber} • Biometric {selectedResultStudent.biometricId}
                </p>
              </div>

              <div className="space-y-4">
                {selectedResultGroups.map((group) => {
                  const percentage = group.totalMarks > 0 ? Math.round((group.totalObtained / group.totalMarks) * 100) : 0;
                  return (
                    <div key={group.examName} className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">{group.examName}</h4>
                          <p className="text-sm text-slate-600">Grouped by subject result entries</p>
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          {percentage}%
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50 text-left text-slate-600">
                            <tr>
                              <th className="px-4 py-3 font-medium">Subject</th>
                              <th className="px-4 py-3 font-medium">Teacher</th>
                              <th className="px-4 py-3 font-medium">Marks</th>
                              <th className="px-4 py-3 font-medium">Grade</th>
                              <th className="px-4 py-3 font-medium">Remark</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {group.examRecords.map((record) => (
                              <tr key={record.id}>
                                <td className="px-4 py-3 text-slate-700">{record.subject}</td>
                                <td className="px-4 py-3 text-slate-700">{record.teacherName}</td>
                                <td className="px-4 py-3 text-slate-700">
                                  {record.marksObtained}/{record.totalMarks}
                                </td>
                                <td className="px-4 py-3 text-slate-700">{record.grade}</td>
                                <td className="px-4 py-3 text-slate-600">{record.remark}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {selectedResultGroups.length === 0 ? (
                  <p className="text-sm text-slate-500">No result records are available for this student yet.</p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
            <h3 className="text-lg font-semibold text-slate-900">Attendance Log</h3>
            <p className="text-sm text-slate-600">Review biometric and manual attendance records.</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {(["all", "biometric", "manual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAttendanceFilter(option)}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  attendanceFilter === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {option === "all" ? "All" : option === "biometric" ? "Biometric" : "Manual"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{record.studentName}</div>
                    <div className="text-xs text-slate-500">{record.className}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 text-slate-700">{record.time}</td>
                  <td className="px-6 py-4 text-slate-700 capitalize">{record.source}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        record.status === "Present"
                          ? "bg-emerald-100 text-emerald-700"
                          : record.status === "Late"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{record.note || "-"}</td>
                </tr>
              ))}
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                    No attendance records found for the selected view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
