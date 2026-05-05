import { useMemo, useState } from "react";
import { CalendarToday, CheckCircle, Cancel, Schedule } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type AttendanceRecord = {
  id: number;
  name: string;
  checkIn: string;
  checkOut: string;
  workingHours: string;
  status: string;
  overtime: string;
  date: string;
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState("2026-05-05");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 1,
      name: "John Smith",
      checkIn: "08:45 AM",
      checkOut: "04:30 PM",
      workingHours: "7h 45m",
      status: "On Time",
      overtime: "0h",
      date: "2026-05-05",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      checkIn: "09:15 AM",
      checkOut: "05:00 PM",
      workingHours: "7h 45m",
      status: "Late",
      overtime: "0h 30m",
      date: "2026-05-05",
    },
    {
      id: 3,
      name: "Michael Chen",
      checkIn: "08:30 AM",
      checkOut: "03:45 PM",
      workingHours: "7h 15m",
      status: "Early Exit",
      overtime: "0h",
      date: "2026-05-05",
    },
    {
      id: 4,
      name: "Emma Williams",
      checkIn: "08:50 AM",
      checkOut: "05:30 PM",
      workingHours: "8h 40m",
      status: "On Time",
      overtime: "1h 30m",
      date: "2026-05-05",
    },
  ]);

  const visibleRecords = useMemo(
    () => attendanceRecords.filter((record) => record.date === selectedDate),
    [attendanceRecords, selectedDate],
  );

  const summary = useMemo(
    () => ({
      total: 247,
      present: visibleRecords.length,
      absent: Math.max(0, 247 - visibleRecords.length - 13),
      late: visibleRecords.filter((record) => record.status === "Late").length,
      onLeave: 13,
    }),
    [visibleRecords],
  );

  const checkInDefaults = useMemo<ActionDialogValues>(
    () => ({
      name: "",
      date: selectedDate,
      checkIn: "08:30 AM",
      checkOut: "04:00 PM",
      workingHours: "8h 00m",
      status: "On Time",
      overtime: "0h",
    }),
    [selectedDate],
  );

  const handleCheckIn = (values: ActionDialogValues) => {
    setAttendanceRecords((current) => [
      {
        id: Date.now(),
        name: String(values.name ?? ""),
        checkIn: String(values.checkIn ?? "08:30 AM"),
        checkOut: String(values.checkOut ?? "04:00 PM"),
        workingHours: String(values.workingHours ?? "8h 00m"),
        status: String(values.status ?? "On Time"),
        overtime: String(values.overtime ?? "0h"),
        date: String(values.date ?? selectedDate),
      },
      ...current,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Staff Attendance & Time Tracking</h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setCheckInOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Manual Check-In
          </button>
        </div>
      </div>

      <ActionDialog
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        title="Manual Check-In"
        description="Add a staff attendance record for the selected date."
        submitLabel="Save Check-In"
        initialValues={checkInDefaults}
        fields={[
          { name: "name", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "date", label: "Date", type: "date" },
          { name: "checkIn", label: "Check-In Time", placeholder: "08:30 AM" },
          { name: "checkOut", label: "Check-Out Time", placeholder: "04:00 PM" },
          { name: "workingHours", label: "Working Hours", placeholder: "8h 00m" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "On Time", value: "On Time" },
              { label: "Late", value: "Late" },
              { label: "Early Exit", value: "Early Exit" },
            ],
          },
          { name: "overtime", label: "Overtime", placeholder: "0h" },
        ]}
        onSubmit={handleCheckIn}
      />

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
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-blue-600">{summary.onLeave}</p>
            </div>
            <CalendarToday className="text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Details - {selectedDate}</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-In</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Working Hours</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Overtime</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{record.name}</td>
                    <td className="py-3 px-4 text-gray-700">{record.checkIn}</td>
                    <td className="py-3 px-4 text-gray-700">{record.checkOut}</td>
                    <td className="py-3 px-4 text-gray-700">{record.workingHours}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          record.status === "On Time"
                            ? "bg-green-100 text-green-700"
                            : record.status === "Late"
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
          {visibleRecords.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">No attendance records found for the selected date.</p>
          )}
        </div>
      </div>
    </div>
  );
}
