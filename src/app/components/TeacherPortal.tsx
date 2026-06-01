import { useMemo, useState } from "react";
import { EventNote, Fingerprint, People, Search, Storage } from "@mui/icons-material";
import { useAuth } from "../auth";
import { loadLeaveRequests, saveLeaveRequests, type LeaveRequest } from "../leave-requests-store";
import {
  addStudentResult,
  addStudentAttendance,
  getStudentAttendance,
  getStudentResults,
  getStudents,
  type StudentAttendanceRecord,
  type StudentResultRecord,
  type StudentRecord,
} from "../student-data";

type TeacherAttendanceStatus = "Present" | "Absent" | "Late";

type BiometricDeviceScan = {
  id: number;
  biometricId: string;
  studentName: string;
  className: string;
  group: string;
  section: string;
  scanTime: string;
  date: string;
  status: TeacherAttendanceStatus;
  source: "device";
  synced: boolean;
};

function calculateLeaveDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateValue: string) {
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

const DEVICE_SCANS: BiometricDeviceScan[] = [
  {
    id: 1,
    biometricId: "BIO-1001",
    studentName: "Ayesha Khan",
    className: "Class 10",
    group: "Science",
    section: "A",
    scanTime: "08:01",
    date: "2026-05-30",
    status: "Present",
    source: "device",
    synced: true,
  },
  {
    id: 2,
    biometricId: "BIO-1002",
    studentName: "Rafiul Islam",
    className: "Class 9",
    group: "Business Studies",
    section: "B",
    scanTime: "08:09",
    date: "2026-05-30",
    status: "Late",
    source: "device",
    synced: true,
  },
  {
    id: 3,
    biometricId: "BIO-1004",
    studentName: "Farhan Ahmed",
    className: "Class 10",
    group: "Science",
    section: "B",
    scanTime: "08:14",
    date: "2026-05-30",
    status: "Present",
    source: "device",
    synced: false,
  },
  {
    id: 4,
    biometricId: "BIO-1005",
    studentName: "Mim Akter",
    className: "Class 8",
    group: "Arts",
    section: "A",
    scanTime: "08:18",
    date: "2026-05-30",
    status: "Absent",
    source: "device",
    synced: false,
  },
];

export default function TeacherPortal() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<"attendance" | "results" | "leave">("attendance");
  const [department, setDepartment] = useState("General");
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [startDate, setStartDate] = useState("2026-05-16");
  const [endDate, setEndDate] = useState("2026-05-16");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>(() => loadLeaveRequests());

  const [students, setStudents] = useState<StudentRecord[]>(() => getStudents());
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>(() => getStudentAttendance());
  const [resultRecords, setResultRecords] = useState<StudentResultRecord[]>(() => getStudentResults());
  const [attendanceDate, setAttendanceDate] = useState(currentDate());
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TeacherAttendanceStatus>("Present");
  const [manualNote, setManualNote] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [deviceScans, setDeviceScans] = useState<BiometricDeviceScan[]>(DEVICE_SCANS);
  const [resultDate, setResultDate] = useState(currentDate());
  const [resultExamName, setResultExamName] = useState("Mid Term 2026");
  const [resultSubject, setResultSubject] = useState("Mathematics");
  const [resultMarksObtained, setResultMarksObtained] = useState("0");
  const [resultTotalMarks, setResultTotalMarks] = useState("100");
  const [resultRemark, setResultRemark] = useState("");
  const [selectedResultStudentId, setSelectedResultStudentId] = useState("");

  const myRequests = useMemo(
    () => allRequests.filter((request) => request.teacher === session.name),
    [allRequests, session.name],
  );

  const classes = useMemo(() => [...new Set(students.map((student) => student.className))].sort(), [students]);
  const groups = useMemo(() => [...new Set(students.map((student) => student.group))].sort(), [students]);
  const sections = useMemo(() => [...new Set(students.map((student) => student.section))].sort(), [students]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.biometricId.toLowerCase().includes(query);
      const matchesClass = !classFilter || student.className === classFilter;
      const matchesGroup = !groupFilter || student.group === groupFilter;
      const matchesSection = !sectionFilter || student.section === sectionFilter;
      return matchesSearch && matchesClass && matchesGroup && matchesSection;
    });
  }, [classFilter, groupFilter, sectionFilter, studentSearch, students]);

  const filteredTodayAttendance = useMemo(
    () => attendanceRecords.filter((record) => record.date === attendanceDate),
    [attendanceDate, attendanceRecords],
  );

  const deviceFeed = useMemo(
    () =>
      deviceScans.filter((scan) => {
        const matchesClass = !classFilter || scan.className === classFilter;
        const matchesGroup = !groupFilter || scan.group === groupFilter;
        const matchesSection = !sectionFilter || scan.section === sectionFilter;
        return matchesClass && matchesGroup && matchesSection;
      }),
    [classFilter, deviceScans, groupFilter, sectionFilter],
  );

  const summary = useMemo(() => {
    const present = filteredTodayAttendance.filter((record) => record.status === "Present").length;
    const late = filteredTodayAttendance.filter((record) => record.status === "Late").length;
    const biometricSynced = attendanceRecords.filter((record) => record.source === "biometric").length;
    const manualEntries = attendanceRecords.filter((record) => record.source === "manual").length;

    return {
      totalStudents: filteredStudents.length,
      present,
      late,
      biometricSynced,
      manualEntries,
    };
  }, [attendanceRecords, filteredStudents.length, filteredTodayAttendance]);

  const filteredResultRecords = useMemo(
    () =>
      resultRecords.filter((record) => {
        const matchesClass = !classFilter || record.className === classFilter;
        const matchesGroup = !groupFilter || record.group === groupFilter;
        const matchesSection = !sectionFilter || record.section === sectionFilter;
        const matchesSearch =
          !studentSearch.trim() ||
          record.studentName.toLowerCase().includes(studentSearch.trim().toLowerCase()) ||
          record.subject.toLowerCase().includes(studentSearch.trim().toLowerCase()) ||
          record.examName.toLowerCase().includes(studentSearch.trim().toLowerCase());
        return matchesClass && matchesGroup && matchesSection && matchesSearch;
      }),
    [classFilter, groupFilter, resultRecords, sectionFilter, studentSearch],
  );

  const resultSheetStudent = useMemo(
    () => students.find((student) => String(student.id) === selectedResultStudentId) ?? null,
    [selectedResultStudentId, students],
  );

  const selectedStudentResultRecords = useMemo(
    () => resultRecords.filter((record) => String(record.studentId) === selectedResultStudentId),
    [resultRecords, selectedResultStudentId],
  );

  const syncDeviceScan = (scan: BiometricDeviceScan) => {
    if (scan.synced) {
      setNotice(`Biometric scan for ${scan.studentName} is already synced.`);
      return;
    }

    const student = students.find((item) => item.biometricId === scan.biometricId);
    if (!student) {
      setNotice(`No student mapped to biometric ID ${scan.biometricId}.`);
      return;
    }

    addStudentAttendance({
      studentId: student.id,
      date: scan.date,
      time: scan.scanTime,
      source: "biometric",
      status: scan.status,
      note: `Synced from biometric device ${scan.biometricId}`,
    });

    setStudents(getStudents());
    setAttendanceRecords(getStudentAttendance());
    setDeviceScans((current) => current.map((item) => (item.id === scan.id ? { ...item, synced: true } : item)));
    setNotice(`Synced biometric attendance for ${student.name}.`);
    setActiveTab("attendance");
  };

  const submitManualAttendance = () => {
    if (!selectedStudentId) {
      setNotice("Please select a student first.");
      return;
    }

    const student = students.find((item) => item.id === Number(selectedStudentId));
    if (!student) {
      setNotice("Selected student was not found.");
      return;
    }

    addStudentAttendance({
      studentId: student.id,
      date: attendanceDate,
      time: currentTime(),
      source: "manual",
      status: selectedStatus,
      note: manualNote.trim() || `Manual attendance by ${session.name}`,
    });

    setStudents(getStudents());
    setAttendanceRecords(getStudentAttendance());
    setResultRecords(getStudentResults());
    setManualNote("");
    setNotice(`Recorded manual attendance for ${student.name}.`);
  };

  const submitResult = () => {
    if (!selectedStudentId) {
      setNotice("Please select a student before saving result data.");
      return;
    }

    const student = students.find((item) => item.id === Number(selectedStudentId));
    if (!student) {
      setNotice("Selected student was not found.");
      return;
    }

    const marksObtained = Number(resultMarksObtained);
    const totalMarks = Number(resultTotalMarks);

    if (Number.isNaN(marksObtained) || Number.isNaN(totalMarks) || totalMarks <= 0) {
      setNotice("Please enter valid marks and total marks.");
      return;
    }

    const nextResult = addStudentResult({
      studentId: student.id,
      examName: resultExamName.trim() || "Exam",
      subject: resultSubject.trim() || "Subject",
      teacherName: session.name,
      examDate: resultDate,
      marksObtained,
      totalMarks,
      remark: resultRemark.trim() || `${session.name} recorded this result.`,
    });

    setResultRecords(getStudentResults());
    setSelectedResultStudentId(String(student.id));
    setNotice(`Saved ${nextResult.subject} result for ${nextResult.studentName}.`);
  };

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const days = calculateLeaveDays(startDate, endDate);
    if (days <= 0) {
      setNotice("Please select a valid leave date range.");
      return;
    }

    if (!reason.trim()) {
      setNotice("Please enter a reason for leave.");
      return;
    }

    const nextRequest: LeaveRequest = {
      id: Date.now(),
      teacher: session.name,
      department,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
      status: "Pending",
      substitute: null,
      createdBy: "teacher",
    };

    const next = [nextRequest, ...allRequests];
    setAllRequests(next);
    saveLeaveRequests(next);
    setReason("");
    setNotice("Leave request submitted. Admin can now review it in Leave Management.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Teacher Portal</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Take student attendance manually or sync biometric device scans, then continue to leave requests from the same portal.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
            Logged in as {session.name}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-slate-200">Students</p>
            <p className="mt-1 text-2xl font-semibold">{summary.totalStudents}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-slate-200">Present</p>
            <p className="mt-1 text-2xl font-semibold">{summary.present}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-slate-200">Late</p>
            <p className="mt-1 text-2xl font-semibold">{summary.late}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-slate-200">Biometric Synced</p>
            <p className="mt-1 text-2xl font-semibold">{summary.biometricSynced}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-slate-200">Manual Entries</p>
            <p className="mt-1 text-2xl font-semibold">{summary.manualEntries}</p>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</div>
      ) : null}

      <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "attendance" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Attendance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("results")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "results" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Results
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leave")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "leave" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Leave Requests
        </button>
      </div>

      {activeTab === "attendance" ? (
        <div className="space-y-6">
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Manual Attendance</h3>
              <p className="text-sm text-slate-600">
                Filter by class, group, and section, then mark student attendance manually.
              </p>
            </div>

            <div className="grid gap-4 px-6 py-5 lg:grid-cols-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Search Student</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5">
                  <Search fontSize="small" className="text-slate-400" />
                  <input
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    className="w-full outline-none"
                    placeholder="Name, roll, biometric ID"
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Class</span>
                <select
                  aria-label="Filter students by class"
                  value={classFilter}
                  onChange={(event) => setClassFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All classes</option>
                  {classes.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Group</span>
                <select
                  aria-label="Filter students by group"
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All groups</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Section</span>
                <select
                  aria-label="Filter students by section"
                  value={sectionFilter}
                  onChange={(event) => setSectionFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All sections</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Attendance Date</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(event) => setAttendanceDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Select Student</span>
                <select
                  value={selectedStudentId}
                  onChange={(event) => {
                    setSelectedStudentId(event.target.value);
                    setSelectedResultStudentId(event.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose a student</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.className} {student.group} {student.section}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Status</span>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as TeacherAttendanceStatus)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Note</span>
                <input
                  value={manualNote}
                  onChange={(event) => setManualNote(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional note"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={submitManualAttendance}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <People fontSize="small" />
                Save Manual Attendance
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Student List</h3>
              <p className="text-sm text-slate-600">Students are filtered by class, group, and section for quick attendance marking.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Class</th>
                    <th className="px-6 py-3 font-medium">Group</th>
                    <th className="px-6 py-3 font-medium">Section</th>
                    <th className="px-6 py-3 font-medium">Biometric ID</th>
                    <th className="px-6 py-3 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.map((student) => {
                    const lastRecord = filteredTodayAttendance.find((record) => record.studentId === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">Roll {student.rollNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{student.className}</td>
                        <td className="px-6 py-4 text-slate-700">{student.group}</td>
                        <td className="px-6 py-4 text-slate-700">{student.section}</td>
                        <td className="px-6 py-4 text-slate-700">{student.biometricId}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                lastRecord?.status === "Present"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : lastRecord?.status === "Late"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {lastRecord?.status ?? student.attendanceStatus}
                            </span>
                            <span className="text-xs text-slate-500">
                              {lastRecord ? `${lastRecord.source} at ${lastRecord.time}` : `Last stored ${student.lastAttendanceSource} at ${student.lastAttendanceTime}`}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                        No students match the selected filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Biometric Device Feed</h3>
              <p className="text-sm text-slate-600">Demo data from the device can be synced into attendance records.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Biometric ID</th>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Class</th>
                    <th className="px-6 py-3 font-medium">Group</th>
                    <th className="px-6 py-3 font-medium">Section</th>
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {deviceFeed.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 text-slate-700">{scan.biometricId}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{scan.studentName}</div>
                        <div className="text-xs text-slate-500">{formatDateLabel(scan.date)}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{scan.className}</td>
                      <td className="px-6 py-4 text-slate-700">{scan.group}</td>
                      <td className="px-6 py-4 text-slate-700">{scan.section}</td>
                      <td className="px-6 py-4 text-slate-700">{scan.scanTime}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            scan.status === "Present"
                              ? "bg-emerald-100 text-emerald-700"
                              : scan.status === "Late"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {scan.synced ? "Synced" : "Pending"} • {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => syncDeviceScan(scan)}
                          disabled={scan.synced}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Storage fontSize="small" />
                          {scan.synced ? "Synced" : "Sync Device Scan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Attendance Log</h3>
              <p className="text-sm text-slate-600">Combined manual and biometric attendance for the selected date.</p>
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
                  {filteredTodayAttendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{record.studentName}</div>
                        <div className="text-xs text-slate-500">{record.className}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{formatDateLabel(record.date)}</td>
                      <td className="px-6 py-4 text-slate-700">{record.time}</td>
                      <td className="px-6 py-4 capitalize text-slate-700">{record.source}</td>
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
                      <td className="px-6 py-4 text-slate-600">{record.note}</td>
                    </tr>
                  ))}
                  {filteredTodayAttendance.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                        No attendance has been saved for this date yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : activeTab === "results" ? (
        <div className="space-y-6">
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Exam Result Entry</h3>
              <p className="text-sm text-slate-600">Add result marks subject by subject for the selected student.</p>
            </div>

            <div className="grid gap-4 px-6 py-5 lg:grid-cols-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Filter Student</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5">
                  <Search fontSize="small" className="text-slate-400" />
                  <input
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    className="w-full outline-none"
                    placeholder="Search by name or subject"
                  />
                </div>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Class</span>
                <select
                  aria-label="Filter results by class"
                  value={classFilter}
                  onChange={(event) => setClassFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All classes</option>
                  {classes.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Group</span>
                <select
                  aria-label="Filter results by group"
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All groups</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Section</span>
                <select
                  aria-label="Filter results by section"
                  value={sectionFilter}
                  onChange={(event) => setSectionFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All sections</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Student</span>
                <select
                  value={selectedStudentId}
                  onChange={(event) => {
                    setSelectedStudentId(event.target.value);
                    setSelectedResultStudentId(event.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose a student</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.className} {student.group} {student.section}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Exam Date</span>
                <input
                  type="date"
                  value={resultDate}
                  onChange={(event) => setResultDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Exam Name</span>
                <input
                  value={resultExamName}
                  onChange={(event) => setResultExamName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Mid Term 2026"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Subject</span>
                <input
                  value={resultSubject}
                  onChange={(event) => setResultSubject(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Mathematics"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Marks Obtained</span>
                <input
                  type="number"
                  value={resultMarksObtained}
                  onChange={(event) => setResultMarksObtained(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="88"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Total Marks</span>
                <input
                  type="number"
                  value={resultTotalMarks}
                  onChange={(event) => setResultTotalMarks(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="100"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
                <span>Remark</span>
                <input
                  value={resultRemark}
                  onChange={(event) => setResultRemark(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional teacher remark"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={submitResult}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Fingerprint fontSize="small" />
                Save Exam Result
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Result Records</h3>
              <p className="text-sm text-slate-600">All exam and subject-wise result entries saved from this portal.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Exam</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">Marks</th>
                    <th className="px-6 py-3 font-medium">Grade</th>
                    <th className="px-6 py-3 font-medium">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredResultRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{record.studentName}</div>
                        <div className="text-xs text-slate-500">
                          {record.className} {record.group} {record.section}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{record.examName}</td>
                      <td className="px-6 py-4 text-slate-700">{record.subject}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {record.marksObtained}/{record.totalMarks}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{record.grade}</td>
                      <td className="px-6 py-4 text-slate-700">{record.teacherName}</td>
                    </tr>
                  ))}
                  {filteredResultRecords.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>
                        No result records found for the selected filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          {resultSheetStudent ? (
            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Result Sheet Preview</h3>
                  <p className="text-sm text-slate-600">Selected student result sheet grouped by exam and subject.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResultStudentId("")}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Clear Preview
                </button>
              </div>

              <div className="overflow-x-auto p-6">
                <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{resultSheetStudent.name}</p>
                  <p>{resultSheetStudent.className} {resultSheetStudent.group} {resultSheetStudent.section}</p>
                  <p>Roll {resultSheetStudent.rollNumber} • Biometric {resultSheetStudent.biometricId}</p>
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Exam</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Teacher</th>
                      <th className="px-4 py-3 font-medium">Marks</th>
                      <th className="px-4 py-3 font-medium">Grade</th>
                      <th className="px-4 py-3 font-medium">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedStudentResultRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 text-slate-700">{record.examName}</td>
                        <td className="px-4 py-3 text-slate-700">{record.subject}</td>
                        <td className="px-4 py-3 text-slate-700">{record.teacherName}</td>
                        <td className="px-4 py-3 text-slate-700">{record.marksObtained}/{record.totalMarks}</td>
                        <td className="px-4 py-3 text-slate-700">{record.grade}</td>
                        <td className="px-4 py-3 text-slate-600">{record.remark}</td>
                      </tr>
                    ))}
                    {selectedStudentResultRecords.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                          No result sheet data for this student yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center gap-2">
              <EventNote className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Request Leave</h3>
            </div>

            <form onSubmit={submitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-gray-700">
                Department
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your department"
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Leave Type
                <select
                  value={leaveType}
                  onChange={(event) => setLeaveType(event.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                End Date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="md:col-span-2 text-sm font-medium text-gray-700">
                Reason
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for leave"
                />
              </label>

              <div className="md:col-span-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total days: {calculateLeaveDays(startDate, endDate) || 0}
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Fingerprint className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Attendance Scope</h3>
            </div>
            <p className="text-sm text-gray-600">
              Attendance is handled from this same teacher portal. Use the Attendance tab to filter by class, group, and section, then save manual or biometric records.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
              <p className="font-semibold">What is included</p>
              <p>Manual attendance entry by class, group, and section.</p>
              <p>Biometric device sync with demo device records.</p>
              <p>Combined attendance log for the selected date.</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 xl:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Leave Requests</h3>
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{request.leaveType}</p>
                      <p className="text-sm text-gray-600">
                        {request.startDate} to {request.endDate} ({request.days} days)
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        request.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : request.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{request.reason}</p>
                </div>
              ))}
              {myRequests.length === 0 ? (
                <p className="text-sm text-gray-500">No leave requests submitted yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
