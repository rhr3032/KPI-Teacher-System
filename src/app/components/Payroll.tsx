import { useMemo, useState } from "react";
import { AttachMoney, Download, Visibility } from "@mui/icons-material";

type PayrollRecord = {
  id: number;
  name: string;
  month: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  advance: number;
  netSalary: number;
  status: string;
};

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([
    {
      id: 1,
      name: "John Smith",
      month: "2026-05",
      baseSalary: 50000,
      overtime: 2500,
      bonus: 5000,
      deductions: 1500,
      advance: 0,
      netSalary: 56000,
      status: "Processed",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      month: "2026-05",
      baseSalary: 55000,
      overtime: 3000,
      bonus: 6000,
      deductions: 2000,
      advance: 5000,
      netSalary: 57000,
      status: "Processed",
    },
    {
      id: 3,
      name: "Michael Chen",
      month: "2026-05",
      baseSalary: 35000,
      overtime: 1000,
      bonus: 3000,
      deductions: 500,
      advance: 0,
      netSalary: 38500,
      status: "Pending",
    },
    {
      id: 4,
      name: "Emma Williams",
      month: "2026-05",
      baseSalary: 30000,
      overtime: 1500,
      bonus: 2500,
      deductions: 1000,
      advance: 3000,
      netSalary: 30000,
      status: "Pending",
    },
  ]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const visibleRecords = useMemo(
    () => payrollData.filter((record) => record.month === selectedMonth),
    [payrollData, selectedMonth],
  );

  const summaryStats = useMemo(
    () => ({
      totalPayroll: visibleRecords.reduce((total, record) => total + record.netSalary, 0),
      processed: visibleRecords.filter((record) => record.status === "Processed").reduce((total, record) => total + record.netSalary, 0),
      pending: visibleRecords.filter((record) => record.status === "Pending").reduce((total, record) => total + record.netSalary, 0),
      employees: visibleRecords.length,
    }),
    [visibleRecords],
  );

  const processPayroll = () => {
    setPayrollData((current) =>
      current.map((record) =>
        record.month === selectedMonth && record.status === "Pending"
          ? { ...record, status: "Processed" }
          : record,
      ),
    );
  };

  const downloadSlip = (record: PayrollRecord) => {
    const csv = [
      ["Field", "Value"],
      ["Teacher", record.name],
      ["Month", record.month],
      ["Base Salary", record.baseSalary.toString()],
      ["Overtime", record.overtime.toString()],
      ["Bonus", record.bonus.toString()],
      ["Deductions", record.deductions.toString()],
      ["Advance", record.advance.toString()],
      ["Net Salary", record.netSalary.toString()],
      ["Status", record.status],
    ]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.name.toLowerCase().replace(/\s+/g, "-")}-${record.month}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Salary & Payroll System</h2>
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={processPayroll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <AttachMoney />
            Process Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Payroll</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ${summaryStats.totalPayroll.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Processed</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ${summaryStats.processed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            ${summaryStats.pending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{summaryStats.employees}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payroll Details - {selectedMonth}</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Base Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Overtime</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Bonus</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Deductions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Advance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{record.name}</td>
                    <td className="py-3 px-4 text-gray-700">${record.baseSalary.toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-600">+${record.overtime.toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-600">+${record.bonus.toLocaleString()}</td>
                    <td className="py-3 px-4 text-red-600">-${record.deductions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-red-600">
                      {record.advance > 0 ? `-$${record.advance.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ${record.netSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          record.status === "Processed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Visibility fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadSlip(record)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Download fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleRecords.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">No payroll entries found for the selected month.</p>
          )}
        </div>
      </div>

      {selectedRecord && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Selected Payroll Record</h4>
          <p className="text-sm text-green-800">
            {selectedRecord.name} - {selectedRecord.month} - ${selectedRecord.netSalary.toLocaleString()}
          </p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Salary Components</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>• Base Salary: Fixed monthly compensation</div>
          <div>• Overtime Pay: From attendance records</div>
          <div>• Fixed Bonus: Festival/predetermined bonuses</div>
          <div>• Performance Bonus: Linked to ACR scores</div>
          <div>• Deductions: Leave deductions</div>
          <div>• Advance Salary: Tracked and recovered</div>
        </div>
      </div>
    </div>
  );
}
