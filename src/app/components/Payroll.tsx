import { useMemo, useState } from "react";
import { AttachMoney, CheckCircle, Download, Visibility } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type PayrollStatus = "Paid" | "Pending";
type AdvanceRequestStatus = "Pending" | "Paid" | "Rejected";

type PayrollRecord = {
  id: number;
  name: string;
  month: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  advanceBalance: number;
  status: PayrollStatus;
  paidAmount?: number;
  advanceRecovered?: number;
  paidOn?: string;
};

type AdvanceRequest = {
  id: number;
  teacherId: number;
  teacherName: string;
  amount: number;
  reason: string;
  requestedAt: string;
  status: AdvanceRequestStatus;
  paidAt?: string;
};

type SalarySnapshot = {
  grossSalary: number;
  advanceRecovery: number;
  netSalary: number;
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function formatDateLabel(dateValue: string) {
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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function computeSalary(record: PayrollRecord): SalarySnapshot {
  const grossSalary = record.baseSalary + record.overtime + record.bonus;
  const payableBeforeAdvance = Math.max(grossSalary - record.deductions, 0);
  const advanceRecovery = Math.min(record.advanceBalance, payableBeforeAdvance);
  const netSalary = Math.max(payableBeforeAdvance - advanceRecovery, 0);

  return { grossSalary, advanceRecovery, netSalary };
}

function createSamplePayrollData(): PayrollRecord[] {
  return [
    {
      id: 1,
      name: "John Smith",
      month: "2026-05",
      baseSalary: 50000,
      overtime: 2500,
      bonus: 5000,
      deductions: 1500,
      advanceBalance: 0,
      status: "Paid",
      paidAmount: 56000,
      advanceRecovered: 0,
      paidOn: "2026-05-01",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      month: "2026-05",
      baseSalary: 55000,
      overtime: 3000,
      bonus: 6000,
      deductions: 2000,
      advanceBalance: 0,
      status: "Paid",
      paidAmount: 62000,
      advanceRecovered: 5000,
      paidOn: "2026-05-01",
    },
    {
      id: 3,
      name: "Michael Chen",
      month: "2026-05",
      baseSalary: 35000,
      overtime: 1000,
      bonus: 3000,
      deductions: 500,
      advanceBalance: 0,
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
      advanceBalance: 3000,
      status: "Pending",
    },
  ];
}

function createSampleAdvanceRequests(): AdvanceRequest[] {
  return [
    {
      id: 1,
      teacherId: 4,
      teacherName: "Emma Williams",
      amount: 3000,
      reason: "Family emergency",
      requestedAt: "2026-05-04",
      status: "Paid",
      paidAt: "2026-05-04",
    },
    {
      id: 2,
      teacherId: 3,
      teacherName: "Michael Chen",
      amount: 2000,
      reason: "Medical expense",
      requestedAt: "2026-05-05",
      status: "Pending",
    },
  ];
}

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>(createSamplePayrollData);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>(createSampleAdvanceRequests);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);

  const visibleRecords = useMemo(
    () => payrollData.filter((record) => record.month === selectedMonth),
    [payrollData, selectedMonth],
  );

  const summaryStats = useMemo(() => {
    const totals = visibleRecords.reduce(
      (accumulator, record) => {
        const snapshot = computeSalary(record);
        accumulator.gross += snapshot.grossSalary;
        accumulator.payable += snapshot.netSalary;
        accumulator.advance += record.advanceBalance;
        accumulator.paid += record.status === "Paid" ? snapshot.netSalary : 0;
        accumulator.pending += record.status === "Pending" ? snapshot.netSalary : 0;
        return accumulator;
      },
      { gross: 0, payable: 0, advance: 0, paid: 0, pending: 0 },
    );

    return {
      employees: visibleRecords.length,
      totalGross: totals.gross,
      totalPayable: totals.payable,
      totalPaid: totals.paid,
      totalPending: totals.pending,
      outstandingAdvance: totals.advance,
      paidEmployees: visibleRecords.filter((record) => record.status === "Paid").length,
      pendingEmployees: visibleRecords.filter((record) => record.status === "Pending").length,
    };
  }, [visibleRecords]);

  const paySalary = (recordId: number) => {
    setPayrollData((current) =>
      current.map((record) => {
        if (record.id !== recordId || record.status === "Paid") {
          return record;
        }

        const snapshot = computeSalary(record);
        return {
          ...record,
          status: "Paid",
          paidAmount: snapshot.netSalary,
          advanceRecovered: snapshot.advanceRecovery,
          advanceBalance: Math.max(record.advanceBalance - snapshot.advanceRecovery, 0),
          paidOn: new Date().toISOString().slice(0, 10),
        };
      }),
    );
  };

  const openAdvanceSalaryDialog = () => {
    setFormError("");
    setAdvanceDialogOpen(true);
  };

  const submitAdvanceRequest = (values: ActionDialogValues) => {
    const teacherId = Number(values.selectedTeacherId ?? "");
    const amount = Number(values.advanceAmount ?? "");
    const reason = String(values.advanceReason ?? "");
    const teacher = payrollData.find((record) => record.id === teacherId);

    if (!teacher) {
      setFormError("Select a teacher first.");
      return false;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter a valid advance amount.");
      return false;
    }

    const availableAdvanceLimit = Math.max(Math.floor(teacher.baseSalary * 0.4) - teacher.advanceBalance, 0);
    if (amount > availableAdvanceLimit) {
      setFormError(`Advance limit exceeded. Available limit is ${formatCurrency(availableAdvanceLimit)}.`);
      return false;
    }

    setFormError("");
    setAdvanceRequests((current) => [
      {
        id: Date.now(),
        teacherId: teacher.id,
        teacherName: teacher.name,
        amount,
        reason: reason.trim() || "Monthly advance request",
        requestedAt: new Date().toISOString().slice(0, 10),
        status: "Pending",
      },
      ...current,
    ]);
    setAdvanceDialogOpen(false);
    return true;
  };

  const approveAndPayAdvance = (requestId: number) => {
    setAdvanceRequests((current) =>
      current.map((request) =>
        request.id === requestId && request.status === "Pending"
          ? { ...request, status: "Paid", paidAt: new Date().toISOString().slice(0, 10) }
          : request,
      ),
    );

    const request = advanceRequests.find((item) => item.id === requestId);
    if (!request || request.status !== "Pending") {
      return;
    }

    setPayrollData((current) =>
      current.map((record) =>
        record.id === request.teacherId
          ? { ...record, advanceBalance: record.advanceBalance + request.amount }
          : record,
      ),
    );
  };

  const rejectAdvance = (requestId: number) => {
    setAdvanceRequests((current) =>
      current.map((request) =>
        request.id === requestId && request.status === "Pending"
          ? { ...request, status: "Rejected" }
          : request,
      ),
    );
  };

  const downloadSlip = (record: PayrollRecord) => {
    const snapshot = computeSalary(record);
    const csv = [
      ["Field", "Value"],
      ["Teacher", record.name],
      ["Month", record.month],
      ["Base Salary", record.baseSalary.toString()],
      ["Overtime", record.overtime.toString()],
      ["Bonus", record.bonus.toString()],
      ["Deductions", record.deductions.toString()],
      ["Advance Balance", record.advanceBalance.toString()],
      ["Advance Recovered", snapshot.advanceRecovery.toString()],
      ["Net Salary", (record.paidAmount ?? snapshot.netSalary).toString()],
      ["Status", record.status],
      ["Paid On", record.paidOn ?? "-"]
    ]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(record.name)}-${record.month}-salary-slip.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salary & Payroll System</h2>
          <p className="text-sm text-gray-600 mt-1">Admin pays salary, teachers request advances, and advances are recovered from future payroll.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>Month</span>
            <input
              type="text"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY-MM"
              aria-label="Payroll month"
            />
          </label>
          <button
            type="button"
            onClick={openAdvanceSalaryDialog}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <AttachMoney />
            Advance Salary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Gross Payroll</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summaryStats.totalGross)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Net Payroll Due</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(summaryStats.totalPayable)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Outstanding Advance</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(summaryStats.outstandingAdvance)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Paid / Pending</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{summaryStats.paidEmployees} / {summaryStats.pendingEmployees}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Teachers</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{summaryStats.employees}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payroll Details - {selectedMonth}</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Gross</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Advance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Net</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => {
                    const snapshot = computeSalary(record);
                    return (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{record.name}</p>
                          <p className="text-xs text-gray-500">Paid on {record.paidOn ? formatDateLabel(record.paidOn) : "Pending"}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatCurrency(snapshot.grossSalary)}
                          <div className="text-xs text-gray-500">Base {formatCurrency(record.baseSalary)} + OT {formatCurrency(record.overtime)} + Bonus {formatCurrency(record.bonus)}</div>
                        </td>
                        <td className="py-3 px-4 text-red-600">
                          {record.advanceBalance > 0 ? `-${formatCurrency(record.advanceBalance)}` : "-"}
                          <div className="text-xs text-gray-500">Recovered {formatCurrency(snapshot.advanceRecovery)}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {formatCurrency(record.paidAmount ?? snapshot.netSalary)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              record.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(record)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="View payroll"
                            >
                              <Visibility fontSize="small" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadSlip(record)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Download salary slip"
                            >
                              <Download fontSize="small" />
                            </button>
                            <button
                              type="button"
                              onClick={() => paySalary(record.id)}
                              disabled={record.status === "Paid"}
                              className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle fontSize="small" />
                              Pay Salary
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visibleRecords.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">No payroll entries found for the selected month.</p>
            )}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Selected Payroll Record</h4>
          <p className="text-sm text-green-800">
            {selectedRecord.name} - {selectedRecord.month} - {formatCurrency(computeSalary(selectedRecord).netSalary)}
          </p>
          <p className="text-sm text-green-800 mt-1">
            Advance balance: {formatCurrency(selectedRecord.advanceBalance)} | Advance recovered: {formatCurrency(selectedRecord.advanceRecovered ?? 0)}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <h4 className="font-semibold text-gray-900">Advance Requests</h4>
        {advanceRequests.map((request) => (
          <div key={request.id} className="rounded-lg border border-gray-200 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{request.teacherName}</p>
                <p className="text-xs text-gray-500">{request.reason}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  request.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : request.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {request.status}
              </span>
            </div>
            <div className="text-sm text-gray-700 flex items-center justify-between">
              <span>{formatCurrency(request.amount)}</span>
              <span>{formatDateLabel(request.requestedAt)}</span>
            </div>
            {request.status === "Pending" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => approveAndPayAdvance(request.id)}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Approve & Pay
                </button>
                <button
                  type="button"
                  onClick={() => rejectAdvance(request.id)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reject
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <ActionDialog
        open={advanceDialogOpen}
        onOpenChange={setAdvanceDialogOpen}
        title="Advance Salary"
        description="Create a new advance salary request from the payroll screen."
        submitLabel="Submit Advance"
        initialValues={{
          selectedTeacherId: String(payrollData[0]?.id ?? ""),
          advanceAmount: "1000",
          advanceReason: "Monthly advance request",
        }}
        fields={[
          {
            name: "selectedTeacherId",
            label: "Teacher",
            type: "select",
            options: payrollData.map((record) => ({ label: record.name, value: String(record.id) })),
          },
          {
            name: "advanceAmount",
            label: "Advance Amount",
            type: "number",
            placeholder: "Enter requested advance",
          },
          {
            name: "advanceReason",
            label: "Reason",
            type: "textarea",
            placeholder: "Why is the advance needed?",
            rows: 4,
          },
        ]}
        onSubmit={submitAdvanceRequest}
      />

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Salary Logic</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>• Gross salary = base salary + overtime + bonus</div>
          <div>• Advance request is limited to 40% of base salary minus existing balance</div>
          <div>• When admin pays salary, outstanding advance is recovered automatically</div>
          <div>• Salary slip exports the full payout breakdown</div>
        </div>
      </div>
    </div>
  );
}
