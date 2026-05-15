import {
  People,
  AccessTime,
  EventNote,
  Assignment,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { useMemo } from "react";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeachers, formatCurrency } from "../teacher-data";

export default function Dashboard() {
  const teachers = useMemo(() => getTeachers(), []);
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

  const lineChartData = useMemo(
    () =>
      [...teachers]
        .sort((left, right) => left.id - right.id)
        .map((teacher) => ({
          name: teacher.name.split(" ")[0],
          attendanceRate: teacher.attendance.attendanceRate,
          netSalary: teacher.salary.netSalary,
        })),
    [teachers],
  );

  const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

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
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Attendance Overview</h3>
            <p className="text-sm text-gray-600">Teacher and staff attendance rates grouped by department.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="teacherAttendance" name="Teacher Attendance %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="staffAttendance" name="Staff Attendance %" fill="#10b981" radius={[6, 6, 0, 0]} />
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
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow xl:col-span-3">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Teacher Trend Line</h3>
            <p className="text-sm text-gray-600">Attendance, performance, and salary movement across the current teacher base.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                <YAxis yAxisId="left" tick={{ fill: "#6b7280" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280" }} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={(value: number, name: string) => (name === "Net Salary" ? formatCurrency(value) : `${value}%`)} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="attendanceRate" name="Attendance %" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="netSalary" name="Net Salary" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
