import {
  People,
  AccessTime,
  EventNote,
  Assignment,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeachers } from "../teacher-data";
import { getDepartmentColor } from "../department-colors";

export default function Dashboard() {
  const teachers = useMemo(() => getTeachers(), []);
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "teacher" | "staff">("all");
  const staffAttendanceSnapshot = useMemo(
    () => [
      { department: "Administration", status: "Active" },
      { department: "Accounts", status: "Active" },
      { department: "IT", status: "On Leave" },
    ],
    [],
  );

  const stats = [
    { label: "Total Teachers", value: "247", change: "+12", trend: "up", icon: <People /> },
    { label: "Present Today", value: "234", change: "94.7%", trend: "up", icon: <AccessTime /> },
    { label: "Pending Leaves", value: "18", change: "-3", trend: "down", icon: <EventNote /> },
    { label: "Active Tasks", value: "42", change: "+5", trend: "up", icon: <Assignment /> },
  ];

  const departmentData = useMemo(() => {
    const teacherDepartmentData = teachers.reduce<Record<string, { teacherAttendanceTotal: number; teacherCount: number }>>(
      (acc, teacher) => {
        if (!acc[teacher.department]) {
          acc[teacher.department] = {
            teacherAttendanceTotal: 0,
            teacherCount: 0,
          };
        }

        acc[teacher.department].teacherAttendanceTotal += teacher.attendance.attendanceRate;
        acc[teacher.department].teacherCount += 1;
        return acc;
      },
      {},
    );

    const staffDepartmentData = staffAttendanceSnapshot.reduce<Record<string, { staffPresent: number; staffTotal: number }>>(
      (acc, staff) => {
        if (!acc[staff.department]) {
          acc[staff.department] = {
            staffPresent: 0,
            staffTotal: 0,
          };
        }

        acc[staff.department].staffTotal += 1;
        if (staff.status === "Active") {
          acc[staff.department].staffPresent += 1;
        }

        return acc;
      },
      {},
    );

    return [...new Set([...Object.keys(teacherDepartmentData), ...Object.keys(staffDepartmentData)])]
      .sort()
      .map((department) => {
        const teacherStats = teacherDepartmentData[department];
        const staffStats = staffDepartmentData[department];

        return {
          name: department,
          teacherAttendance: teacherStats
            ? Math.round(teacherStats.teacherAttendanceTotal / teacherStats.teacherCount)
            : 0,
          staffAttendance: staffStats ? Math.round((staffStats.staffPresent / staffStats.staffTotal) * 100) : 0,
        };
      });
  }, [staffAttendanceSnapshot, teachers]);

  const typeData = useMemo(() => {
    const counts = teachers.reduce<Record<string, number>>((acc, teacher) => {
      acc[teacher.type] = (acc[teacher.type] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [teachers]);

  const teacherDepartmentPieData = useMemo(() => {
    const counts = teachers.reduce<Record<string, number>>((acc, teacher) => {
      acc[teacher.department] = (acc[teacher.department] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [teachers]);

  const staffDepartmentPieData = useMemo(() => {
    const counts = staffAttendanceSnapshot.reduce<Record<string, number>>((acc, staff) => {
      acc[staff.department] = (acc[staff.department] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [staffAttendanceSnapshot]);

  const showTeacherAttendance = attendanceFilter === "all" || attendanceFilter === "teacher";
  const showStaffAttendance = attendanceFilter === "all" || attendanceFilter === "staff";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <span
                    className={`text-sm ml-1 ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="text-blue-600 text-4xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-lg bg-white shadow xl:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Department Attendance Overview</h3>
              <p className="text-sm text-gray-600">Teacher and staff attendance rates grouped by department.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Filter</span>
              <select
                value={attendanceFilter}
                onChange={(event) => setAttendanceFilter(event.target.value as "all" | "teacher" | "staff")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Both</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </label>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Legend />
                {showTeacherAttendance && (
                  <Bar dataKey="teacherAttendance" name="Teacher Attendance %" radius={[6, 6, 0, 0]}>
                    {departmentData.map((entry) => (
                      <Cell key={`teacher-${entry.name}`} fill={getDepartmentColor(entry.name)} />
                    ))}
                  </Bar>
                )}
                {showStaffAttendance && (
                  <Bar dataKey="staffAttendance" name="Staff Attendance %" radius={[6, 6, 0, 0]}>
                    {departmentData.map((entry) => (
                      <Cell
                        key={`staff-${entry.name}`}
                        fill={getDepartmentColor(entry.name, 0.8)}
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Teacher Types</h3>
            <p className="text-sm text-gray-600">Current distribution across employment types.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} paddingAngle={4}>
                  {typeData.map((entry, index) => (
                    <Cell key={entry.name} fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Wise Teachers</h3>
            <p className="text-sm text-gray-600">Teacher count across departments.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={teacherDepartmentPieData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={65} paddingAngle={4}>
                  {teacherDepartmentPieData.map((entry) => (
                    <Cell key={entry.name} fill={getDepartmentColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Wise Staff</h3>
            <p className="text-sm text-gray-600">Staff count across departments.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={staffDepartmentPieData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={65} paddingAngle={4}>
                  {staffDepartmentPieData.map((entry) => (
                    <Cell key={entry.name} fill={getDepartmentColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
