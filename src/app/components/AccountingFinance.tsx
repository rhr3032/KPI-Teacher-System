import { useMemo, useState } from "react";
import { Assessment, Download, Visibility } from "@mui/icons-material";

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

type PayrollRecord = {
  id: number;
  name: string;
  month: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  advanceBalance: number;
  status: "Paid" | "Pending";
  paidAmount?: number;
};

type StaffExpense = {
  id: number;
  name: string;
  designation: string;
  monthlySalary: number;
};

function computeNetForPayroll(record: PayrollRecord) {
  const gross = record.baseSalary + record.overtime + record.bonus;
  const payableBeforeAdvance = Math.max(gross - record.deductions, 0);
  const advanceRecovery = Math.min(record.advanceBalance, payableBeforeAdvance);
  const net = Math.max(payableBeforeAdvance - advanceRecovery, 0);
  return { gross, net, advanceRecovery };
}

function samplePayroll(): PayrollRecord[] {
  return [
    { id: 1, name: "John Smith", month: "2026-05", baseSalary: 50000, overtime: 2500, bonus: 5000, deductions: 1500, advanceBalance: 0, status: "Paid", paidAmount: 56000 },
    { id: 2, name: "Sarah Johnson", month: "2026-05", baseSalary: 55000, overtime: 3000, bonus: 6000, deductions: 2000, advanceBalance: 0, status: "Paid", paidAmount: 62000 },
    { id: 3, name: "Michael Chen", month: "2026-05", baseSalary: 35000, overtime: 1000, bonus: 3000, deductions: 500, advanceBalance: 0, status: "Pending" },
  ];
}

function sampleStaffExpenses(): StaffExpense[] {
  return [
    { id: 1, name: "John Smith", designation: "HR Officer", monthlySalary: 4000 },
    { id: 2, name: "Sarah Johnson", designation: "Payroll Assistant", monthlySalary: 3800 },
    { id: 3, name: "Michael Chen", designation: "Systems Support", monthlySalary: 3600 },
  ];
}

export default function AccountingFinance() {
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const payroll = useMemo(() => samplePayroll(), []);
  const staff = useMemo(() => sampleStaffExpenses(), []);

  const payrollForMonth = useMemo(() => payroll.filter((p) => p.month === selectedMonth), [payroll, selectedMonth]);

  const payrollTotals = useMemo(() => {
    return payrollForMonth.reduce(
      (acc, rec) => {
        const s = computeNetForPayroll(rec);
        acc.gross += s.gross;
        acc.net += s.net;
        acc.advance += s.advanceRecovery;
        return acc;
      },
      { gross: 0, net: 0, advance: 0 },
    );
  }, [payrollForMonth]);

  const staffTotals = useMemo(() => staff.reduce((acc, s) => ({ total: acc.total + s.monthlySalary }), { total: 0 } as { total: number }), [staff]);

  const totalExpenses = useMemo(() => payrollTotals.net + staffTotals.total, [payrollTotals, staffTotals]);

  const exportCsv = () => {
    const rows: string[][] = [["Type", "Name", "Designation/Desc", "Gross/Monthly", "Net/Amount"]];

    payrollForMonth.forEach((p) => {
      const s = computeNetForPayroll(p);
      rows.push(["Teacher Salary", p.name, "Teacher", String(s.gross), String(s.net)]);
    });

    staff.forEach((st) => {
      rows.push(["Staff Salary", st.name, st.designation, String(st.monthlySalary), String(st.monthlySalary)]);
    });

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounting-${selectedMonth}-expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounting & Finance</h2>
          <p className="text-sm text-gray-600 mt-1">Overview of payroll and staff salary expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <button onClick={exportCsv} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Teacher Payroll (Net)</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(payrollTotals.net)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Staff Salaries (Monthly)</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(staffTotals.total)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Expenses (Net)</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
          <p className="text-sm text-gray-500">{payrollForMonth.length} teacher(s) • {staff.length} staff</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Designation</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Gross / Monthly</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Net / Amount</th>
              </tr>
            </thead>
            <tbody>
              {payrollForMonth.map((p) => {
                const s = computeNetForPayroll(p);
                return (
                  <tr key={`t-${p.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">Teacher Salary</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 px-4">Teacher</td>
                    <td className="py-3 px-4">{formatCurrency(s.gross)}</td>
                    <td className="py-3 px-4">{formatCurrency(s.net)}</td>
                  </tr>
                );
              })}

              {staff.map((st) => (
                <tr key={`s-${st.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">Staff Salary</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{st.name}</td>
                  <td className="py-3 px-4">{st.designation}</td>
                  <td className="py-3 px-4">{formatCurrency(st.monthlySalary)}</td>
                  <td className="py-3 px-4">{formatCurrency(st.monthlySalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
