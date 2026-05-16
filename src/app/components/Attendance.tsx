import { useMemo, useState } from "react";
import { CalendarToday, CheckCircle, Cancel, Schedule, Search, AccessTime, Close } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { getTeachers } from "../teacher-data";

type AttendanceRecord = {
  id: number;
  teacherId: number;
  name: string;
  department: string;
  shift: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: string;
  status: string;
  overtime: string;
  date: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
};

// Define shift times (8-hour shifts)
const SHIFT_CONFIGS = {
  Morning: { start: "08:00", end: "16:00" },
  Day: { start: "08:00", end: "16:00" },
  Evening: { start: "14:00", end: "22:00" },
};

function calculateWorkingHours(checkIn: string | null, checkOut: string | null): { hours: string; minutes: number } {
  if (!checkIn || !checkOut) return { hours: "0h 0m", minutes: 0 };

  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);

  let totalMinutes = outH * 60 + outM - (inH * 60 + inM);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours: `${hours}h ${minutes}m`, minutes: totalMinutes };
}

function calculateOvertime(checkIn: string | null, checkOut: string | null, shiftEnd: string): string {
  if (!checkIn || !checkOut) return "0h";

  const [outH, outM] = checkOut.split(":").map(Number);
  const [shiftH, shiftM] = shiftEnd.split(":").map(Number);

  let overtimeMinutes = outH * 60 + outM - (shiftH * 60 + shiftM);
  if (overtimeMinutes <= 0) return "0h";

  const hours = Math.floor(overtimeMinutes / 60);
  const minutes = overtimeMinutes % 60;

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getStatus(checkIn: string | null): string {
  if (!checkIn) return "Not Checked In";
  const [h, m] = checkIn.split(":").map(Number);
  const checkInMinutes = h * 60 + m;
  const shiftStart = 8 * 60; // 08:00

  if (checkInMinutes <= shiftStart) return "On Time";
  if (checkInMinutes <= shiftStart + 15) return "Slightly Late";
  return "Late";
}

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState("2026-05-05");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"attendance" | "overtime">("attendance");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [overtimeCheckoutOpen, setOvertimeCheckoutOpen] = useState(false);
  const [overtimeRecordsOpen, setOvertimeRecordsOpen] = useState(false);
    const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
    const [overtimeModalDepartment, setOvertimeModalDepartment] = useState<string>("");
    const [overtimeModalTeacher, setOvertimeModalTeacher] = useState<string>("");
    const [overtimeCheckoutTime, setOvertimeCheckoutTime] = useState("");
    const [selectedTeacherForOvertime, setSelectedTeacherForOvertime] = useState<AttendanceRecord | null>(null);

  const teachers = getTeachers();
  const departments = useMemo(() => {
    const depts = new Set(teachers.map((t) => t.department));
    return Array.from(depts).sort();
  }, [teachers]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 1,
      teacherId: 1,
      name: "John Smith",
      department: "Mathematics",
      shift: "Morning",
      checkIn: "08:45",
      checkOut: "16:30",
      workingHours: "7h 45m",
      status: "On Time",
      overtime: "0h 30m",
      date: "2026-05-05",
      shiftStartTime: "08:00",
      shiftEndTime: "16:00",
    },
    {
      id: 2,
      teacherId: 2,
      name: "Sarah Johnson",
      department: "Science",
      shift: "Day",
      checkIn: "09:15",
      checkOut: null,
      workingHours: "0h 0m",
      status: "Late",
      overtime: "0h",
      date: "2026-05-05",
      shiftStartTime: "08:00",
      shiftEndTime: "16:00",
    },
  ]);

  // Filter records for current date
  const visibleRecords = useMemo(
    () => attendanceRecords.filter((record) => record.date === selectedDate),
    [attendanceRecords, selectedDate],
  );

  // Search and filter for attendance tab
  const filteredAttendanceRecords = useMemo(() => {
    return visibleRecords.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && record.checkIn;
    });
  }, [visibleRecords, searchQuery]);

  // Filter for overtime management tab
  const overtimeTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesDept = !selectedDepartment || teacher.department === selectedDepartment;
      return matchesDept;
    });
  }, [teachers, selectedDepartment]);

  // Summary calculations
  const summary = useMemo(
    () => ({
      total: teachers.length,
      present: visibleRecords.filter((r) => r.checkIn).length,
      absent: Math.max(0, teachers.length - visibleRecords.filter((r) => r.checkIn).length),
      late: visibleRecords.filter((r) => r.status === "Late" || r.status === "Slightly Late").length,
      withOvertime: visibleRecords.filter((r) => r.overtime !== "0h").length,
    }),
    [visibleRecords, teachers.length],
  );

  const handleCheckIn = (teacherId: number, shiftConfig: (typeof SHIFT_CONFIGS)[keyof typeof SHIFT_CONFIGS]) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const checkInTime = `${hours}:${minutes}`;

    const teacher = teachers.find((t) => t.id === teacherId);
    const existingRecord = visibleRecords.find((r) => r.teacherId === teacherId);

    if (existingRecord && existingRecord.checkIn) {
      // Already checked in
      alert("Teacher already checked in for today!");
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now(),
      teacherId,
      name: teacher?.name || "",
      department: teacher?.department || "",
      shift: teacher?.shift || "Morning",
      checkIn: checkInTime,
      checkOut: null,
      workingHours: "0h 0m",
      status: getStatus(checkInTime),
      overtime: "0h",
      date: selectedDate,
      shiftStartTime: shiftConfig.start,
      shiftEndTime: shiftConfig.end,
    };

    if (existingRecord) {
      // Update existing record
      setAttendanceRecords((current) =>
        current.map((r) => (r.id === existingRecord.id ? newRecord : r)),
      );
    } else {
      // Add new record
      setAttendanceRecords((current) => [newRecord, ...current]);
    }
  };

  const handleManualCheckout = (record: AttendanceRecord, checkOutTime: string) => {
    const { hours, minutes } = calculateWorkingHours(record.checkIn, checkOutTime);
    const shiftEndTime = record.shiftEndTime || "16:00";
    const overtime = calculateOvertime(record.checkIn, checkOutTime, shiftEndTime);

    setAttendanceRecords((current) =>
      current.map((r) =>
        r.id === record.id
          ? {
              ...r,
              checkOut: checkOutTime,
              workingHours: hours,
              overtime,
            }
          : r,
      ),
    );

    setOvertimeCheckoutOpen(false);
    setSelectedTeacherForOvertime(null);
  };

  const handleOvertimeCheckout = (values: ActionDialogValues) => {
    if (selectedTeacherForOvertime) {
      const checkOutTime = String(values.checkOutTime ?? "");
      handleManualCheckout(selectedTeacherForOvertime, checkOutTime);
    }
  };

    const handleOvertimeModalSubmit = () => {
      if (!overtimeModalTeacher || !overtimeCheckoutTime) {
        alert("Please select a teacher and provide checkout time");
        return;
      }

      const teacher = teachers.find((t) => t.id === Number(overtimeModalTeacher));
      if (!teacher) return;

        const shiftConfig = SHIFT_CONFIGS[(teacher.shift || "Morning") as keyof typeof SHIFT_CONFIGS] || SHIFT_CONFIGS.Morning;
    
      // Check if teacher already has a record for today
      let existingRecord = visibleRecords.find((r) => r.teacherId === teacher.id);

      if (!existingRecord) {
        // Create default check-in if not exists
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const checkInTime = `${hours}:${minutes}`;

        existingRecord = {
          id: Date.now(),
          teacherId: teacher.id,
          name: teacher.name,
          department: teacher.department,
          shift: teacher.shift || "Morning",
          checkIn: checkInTime,
          checkOut: null,
          workingHours: "0h 0m",
          status: getStatus(checkInTime),
          overtime: "0h",
          date: selectedDate,
          shiftStartTime: shiftConfig.start,
          shiftEndTime: shiftConfig.end,
        };
      }

      const { hours } = calculateWorkingHours(existingRecord.checkIn, overtimeCheckoutTime);
      const overtime = calculateOvertime(existingRecord.checkIn, overtimeCheckoutTime, shiftConfig.end);

      setAttendanceRecords((current) => {
        const filtered = current.filter((r) => !(r.teacherId === teacher.id && r.date === selectedDate));
        return [
          {
            ...existingRecord,
            checkOut: overtimeCheckoutTime,
            workingHours: hours,
            overtime,
          },
          ...filtered,
        ];
      });

      // Reset and close modal
      setOvertimeModalOpen(false);
      setOvertimeModalDepartment("");
      setOvertimeModalTeacher("");
      setOvertimeCheckoutTime("");
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Staff Attendance & Time Tracking</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setOvertimeModalOpen(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 whitespace-nowrap font-semibold"
            >
              Overtime
            </button>
          </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <CalendarToday className="text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{summary.present}</p>
            </div>
            <CheckCircle className="text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            </div>
            <Cancel className="text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
            </div>
            <Schedule className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Overtime</p>
              <p className="text-2xl font-bold text-purple-600">{summary.withOvertime}</p>
            </div>
            <AccessTime className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 px-6 py-3 font-semibold text-center transition-colors ${
              activeTab === "attendance"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Daily Attendance
          </button>
        </div>

        {/* Daily Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="p-6 space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teacher name or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Available Teachers for Check-In */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Check-In Teachers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Shift</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers
                      .filter((teacher) =>
                        searchQuery === ""
                          ? true
                          : teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            teacher.department.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((teacher) => {
                        const checked = visibleRecords.find((r) => r.teacherId === teacher.id);
                        return (
                          <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{teacher.name}</td>
                            <td className="py-3 px-4 text-gray-700">{teacher.department}</td>
                            <td className="py-3 px-4 text-gray-700">{teacher.shift}</td>
                            <td className="py-3 px-4">
                              {checked ? (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                  Checked In
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                  Not Checked In
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {!checked ? (
                                <button
                                  onClick={() => {
                                    const shiftConfig = SHIFT_CONFIGS[teacher.shift as keyof typeof SHIFT_CONFIGS] || SHIFT_CONFIGS.Morning;
                                    handleCheckIn(teacher.id, shiftConfig);
                                  }}
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                                >
                                  Check-In
                                </button>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  {checked.checkIn}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checked-In Records */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendance Records - {selectedDate}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-Out</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Working Hours</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Overtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{record.name}</td>
                        <td className="py-3 px-4 text-gray-700">{record.department}</td>
                        <td className="py-3 px-4 text-gray-700">{record.checkIn}</td>
                        <td className="py-3 px-4 text-gray-700">{record.checkOut || "-"}</td>
                        <td className="py-3 px-4 text-gray-700">{record.workingHours}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              record.status === "On Time"
                                ? "bg-green-100 text-green-700"
                                : record.status === "Slightly Late"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{record.overtime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAttendanceRecords.length === 0 && (
                <p className="mt-4 text-sm text-gray-500">No checked-in records found for the selected date.</p>
              )}
            </div>
          </div>
        )}


      </div>

      {/* Overtime Checkout Dialog */}
      <ActionDialog
        open={overtimeCheckoutOpen}
        onOpenChange={setOvertimeCheckoutOpen}
        title="Manual Checkout for Overtime"
        description={`Record checkout time for ${selectedTeacherForOvertime?.name || "teacher"}. System will automatically calculate overtime based on shift end time.`}
        submitLabel="Confirm Checkout"
        initialValues={{
          checkOutTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }).replace(":", ""),
        }}
        fields={[
          {
            name: "checkOutTime",
            label: "Check-Out Time (HH:MM)",
            placeholder: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          },
        ]}
        onSubmit={handleOvertimeCheckout}
      />

      {/* Overtime Records Modal */}
      <Dialog open={overtimeRecordsOpen} onOpenChange={setOvertimeRecordsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Teachers with Recorded Overtime - {selectedDate}</DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-In</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Shift End</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Overtime</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords
                  .filter(
                    (r) =>
                      r.overtime !== "0h" &&
                      r.checkOut &&
                      (!selectedDepartment || r.department === selectedDepartment),
                  )
                  .map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{record.name}</td>
                      <td className="py-3 px-4 text-gray-700">{record.department}</td>
                      <td className="py-3 px-4 font-mono text-gray-700">{record.checkIn}</td>
                      <td className="py-3 px-4 font-mono text-gray-700">{record.checkOut}</td>
                      <td className="py-3 px-4 font-mono text-gray-700">{record.shiftEndTime}</td>
                      <td className="py-3 px-4 text-purple-600 font-semibold">{record.overtime}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {visibleRecords.filter((r) => r.overtime !== "0h" && r.checkOut && (!selectedDepartment || r.department === selectedDepartment)).length === 0 && (
            <p className="mt-4 text-sm text-gray-500">No overtime records found.</p>
          )}
        </DialogContent>
      </Dialog>

        {/* Overtime Modal */}
        <Dialog open={overtimeModalOpen} onOpenChange={setOvertimeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Overtime Checkout</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Department Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Department</label>
                <select
                  value={overtimeModalDepartment}
                  onChange={(e) => {
                    setOvertimeModalDepartment(e.target.value);
                    setOvertimeModalTeacher(""); // Reset teacher when department changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose Department...</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Teacher</label>
                <select
                  value={overtimeModalTeacher}
                  onChange={(e) => setOvertimeModalTeacher(e.target.value)}
                  disabled={!overtimeModalDepartment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Choose Teacher...</option>
                  {overtimeModalDepartment &&
                    teachers
                      .filter((t) => t.department === overtimeModalDepartment)
                      .map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.shift} Shift)
                        </option>
                      ))}
                </select>
              </div>

              {/* Checkout Time Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Checkout Time (HH:MM)</label>
                <input
                  type="time"
                  value={overtimeCheckoutTime}
                  onChange={(e) => setOvertimeCheckoutTime(e.target.value)}
                  disabled={!overtimeModalTeacher}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Info */}
              {overtimeModalTeacher && teachers.find((t) => t.id === Number(overtimeModalTeacher)) && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Shift End Time:</span>{" "}
                    {SHIFT_CONFIGS[teachers.find((t) => t.id === Number(overtimeModalTeacher))?.shift as keyof typeof SHIFT_CONFIGS]?.end || "16:00"}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">Overtime will be calculated based on shift end time</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setOvertimeModalOpen(false);
                  setOvertimeModalDepartment("");
                  setOvertimeModalTeacher("");
                  setOvertimeCheckoutTime("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleOvertimeModalSubmit}
                disabled={!overtimeModalTeacher || !overtimeCheckoutTime}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Record Overtime
              </button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
