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

  const stats = [
    { label: "Total Teachers", value: "247", change: "+12", trend: "up", icon: <People /> },
    { label: "Present Today", value: "234", change: "94.7%", trend: "up", icon: <AccessTime /> },
    { label: "Pending Leaves", value: "18", change: "-3", trend: "down", icon: <EventNote /> },
    { label: "Active Tasks", value: "42", change: "+5", trend: "up", icon: <Assignment /> },
  ];

  const departmentChartData = useMemo(
    () =>
      teachers.reduce<Record<string, { name: string; teachers: number; attendanceRate: number }>>(
        (acc, teacher) => {
          if (!acc[teacher.department]) {
            acc[teacher.department] = {
              name: teacher.department,
              teachers: 0,
              attendanceRate: 0,
            };
          }

          acc[teacher.department].teachers += 1;
          acc[teacher.department].attendanceRate += teacher.attendance.attendanceRate;
          return acc;
        },
        {},
      ),
    [teachers],
  );

  const departmentData = useMemo(
    () =>
      Object.values(departmentChartData).map((item) => ({
        name: item.name,
        teachers: item.teachers,
        attendanceRate: Math.round(item.attendanceRate / item.teachers),
      })),
    [departmentChartData],
  );

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
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="text-green-600 text-sm" />
                  ) : (
                    <TrendingDown className="text-red-600 text-sm" />
                  )}
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
            <h3 className="text-lg font-semibold text-gray-900">Department Overview</h3>
            <p className="text-sm text-gray-600">Teacher count, attendance, and performance by department.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="teachers" name="Teachers" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attendanceRate" name="Attendance %" fill="#10b981" radius={[6, 6, 0, 0]} />
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
