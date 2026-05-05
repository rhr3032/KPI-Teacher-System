import { useMemo, useState } from "react";
import { Add, CheckCircle, HourglassEmpty, AttachMoney } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type ExitCase = {
  id: number;
  teacher: string;
  department: string;
  joiningDate: string;
  exitDate: string;
  reason: string;
  status: string;
  exitInterviewCompleted: boolean;
  outstandingSalary: number;
  loanBalance: number;
  finalSettlement: number;
  documentsCleared: boolean;
};

export default function ExitManagement() {
  const [exitCases, setExitCases] = useState<ExitCase[]>([
    {
      id: 1,
      teacher: "Robert Brown",
      department: "Physics",
      joiningDate: "2019-03-15",
      exitDate: "2026-05-31",
      reason: "Career Advancement",
      status: "In Progress",
      exitInterviewCompleted: true,
      outstandingSalary: 5000,
      loanBalance: 2000,
      finalSettlement: 3000,
      documentsCleared: false,
    },
    {
      id: 2,
      teacher: "Lisa Anderson",
      department: "Chemistry",
      joiningDate: "2021-06-10",
      exitDate: "2026-04-30",
      reason: "Relocation",
      status: "Completed",
      exitInterviewCompleted: true,
      outstandingSalary: 0,
      loanBalance: 0,
      finalSettlement: 4500,
      documentsCleared: true,
    },
    {
      id: 3,
      teacher: "David Miller",
      department: "Geography",
      joiningDate: "2022-01-05",
      exitDate: "2026-06-15",
      reason: "Personal Reasons",
      status: "Pending",
      exitInterviewCompleted: false,
      outstandingSalary: 6000,
      loanBalance: 3500,
      finalSettlement: 0,
      documentsCleared: false,
    },
  ]);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const exitDefaults = useMemo<ActionDialogValues>(
    () => ({
      teacher: "",
      department: "",
      joiningDate: "2026-01-01",
      exitDate: "2026-06-01",
      reason: "",
      status: "Pending",
      exitInterviewCompleted: false,
      outstandingSalary: "0",
      loanBalance: "0",
      finalSettlement: "0",
      documentsCleared: false,
    }),
    [],
  );

  const handleExitSubmit = (values: ActionDialogValues) => {
    setExitCases((current) => [
      {
        id: Date.now(),
        teacher: String(values.teacher ?? ""),
        department: String(values.department ?? ""),
        joiningDate: String(values.joiningDate ?? ""),
        exitDate: String(values.exitDate ?? ""),
        reason: String(values.reason ?? ""),
        status: String(values.status ?? "Pending"),
        exitInterviewCompleted: Boolean(values.exitInterviewCompleted),
        outstandingSalary: Number(values.outstandingSalary ?? 0),
        loanBalance: Number(values.loanBalance ?? 0),
        finalSettlement: Number(values.finalSettlement ?? 0),
        documentsCleared: Boolean(values.documentsCleared),
      },
      ...current,
    ]);
  };

  const updateExitCase = (id: number, action: "interview" | "clearance" | "settlement") => {
    setExitCases((current) =>
      current.map((exitCase) => {
        if (exitCase.id !== id) {
          return exitCase;
        }

        if (action === "interview") {
          return { ...exitCase, exitInterviewCompleted: true, status: "In Progress" };
        }

        if (action === "clearance") {
          return { ...exitCase, documentsCleared: true, status: "In Progress" };
        }

        const settlement = Math.max(exitCase.outstandingSalary - exitCase.loanBalance, 0);
        return {
          ...exitCase,
          finalSettlement: settlement,
          exitInterviewCompleted: true,
          documentsCleared: true,
          status: "Completed",
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Exit Management</h2>
        <button
          type="button"
          onClick={() => setExitDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Add />
          Initiate Exit Process
        </button>
      </div>

      <ActionDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        title="Initiate Exit Process"
        description="Create a new exit case and settlement record."
        submitLabel="Create Exit Case"
        initialValues={exitDefaults}
        fields={[
          { name: "teacher", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          { name: "joiningDate", label: "Joining Date", type: "date" },
          { name: "exitDate", label: "Exit Date", type: "date" },
          { name: "reason", label: "Exit Reason", type: "textarea", rows: 3 },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Pending", value: "Pending" },
              { label: "In Progress", value: "In Progress" },
              { label: "Completed", value: "Completed" },
            ],
          },
          { name: "exitInterviewCompleted", label: "Exit Interview Completed", type: "checkbox" },
          { name: "outstandingSalary", label: "Outstanding Salary", type: "number" },
          { name: "loanBalance", label: "Loan Balance", type: "number" },
          { name: "finalSettlement", label: "Final Settlement", type: "number" },
          { name: "documentsCleared", label: "Documents Cleared", type: "checkbox" },
        ]}
        onSubmit={handleExitSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Exit Cases</p>
          <p className="text-2xl font-bold text-gray-900">{exitCases.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {exitCases.filter((c) => c.status === "Pending").length}
              </p>
            </div>
            <HourglassEmpty className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {exitCases.filter((c) => c.status === "In Progress").length}
              </p>
            </div>
            <HourglassEmpty className="text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {exitCases.filter((c) => c.status === "Completed").length}
              </p>
            </div>
            <CheckCircle className="text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Exit Cases</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {exitCases.map((exitCase) => (
              <div
                key={exitCase.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">{exitCase.teacher}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          exitCase.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : exitCase.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {exitCase.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{exitCase.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Joining Date</p>
                    <p className="font-medium text-gray-900">{exitCase.joiningDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Exit Date</p>
                    <p className="font-medium text-gray-900">{exitCase.exitDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Exit Reason</p>
                    <p className="font-medium text-gray-900">{exitCase.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Exit Interview</p>
                    <p className="font-medium">
                      {exitCase.exitInterviewCompleted ? (
                        <span className="text-green-600">✓ Completed</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AttachMoney className="text-gray-600" />
                    <h5 className="font-semibold text-gray-900">Final Settlement Details</h5>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Outstanding Salary</p>
                      <p className="font-semibold text-green-600">
                        ${exitCase.outstandingSalary.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Loan Balance</p>
                      <p className="font-semibold text-red-600">
                        -${exitCase.loanBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Final Settlement</p>
                      <p className="font-semibold text-blue-600">
                        ${exitCase.finalSettlement.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Documents Cleared</p>
                      <p className="font-medium">
                        {exitCase.documentsCleared ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {exitCase.status !== "Completed" && (
                  <div className="mt-4 flex gap-2">
                    {!exitCase.exitInterviewCompleted && (
                      <button
                        type="button"
                        onClick={() => updateExitCase(exitCase.id, "interview")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Schedule Exit Interview
                      </button>
                    )}
                    {!exitCase.documentsCleared && (
                      <button
                        type="button"
                        onClick={() => updateExitCase(exitCase.id, "clearance")}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                      >
                        Process Document Clearance
                      </button>
                    )}
                    {exitCase.finalSettlement > 0 && (
                      <button
                        type="button"
                        onClick={() => updateExitCase(exitCase.id, "settlement")}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Disburse Final Settlement
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Exit Process Checklist</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Exit interview form completion</li>
          <li>• Outstanding salary calculation and disbursement</li>
          <li>• Loan balance adjustment and recovery reconciliation</li>
          <li>• Document clearance checklist and issuance</li>
        </ul>
      </div>
    </div>
  );
}
