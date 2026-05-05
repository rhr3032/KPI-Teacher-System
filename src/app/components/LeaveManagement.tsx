import { useMemo, useState } from "react";
import { Add, CheckCircle, Cancel, HourglassEmpty } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type LeaveRequest = {
  id: number;
  teacher: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  substitute: string | null;
};

export default function LeaveManagement() {
  const [filter, setFilter] = useState("all");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      teacher: "John Smith",
      department: "Mathematics",
      leaveType: "Sick Leave",
      startDate: "2026-05-10",
      endDate: "2026-05-12",
      days: 3,
      reason: "Medical treatment",
      status: "Pending",
      substitute: null,
    },
    {
      id: 2,
      teacher: "Sarah Johnson",
      department: "Science",
      leaveType: "Annual Leave",
      startDate: "2026-05-15",
      endDate: "2026-05-20",
      days: 6,
      reason: "Personal vacation",
      status: "Approved",
      substitute: "Michael Chen",
    },
    {
      id: 3,
      teacher: "Emma Williams",
      department: "History",
      leaveType: "Emergency Leave",
      startDate: "2026-05-06",
      endDate: "2026-05-06",
      days: 1,
      reason: "Family emergency",
      status: "Rejected",
      substitute: null,
    },
    {
      id: 4,
      teacher: "Michael Chen",
      department: "English",
      leaveType: "Sick Leave",
      startDate: "2026-05-08",
      endDate: "2026-05-09",
      days: 2,
      reason: "Flu",
      status: "Approved",
      substitute: "John Smith",
    },
  ]);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter((req) => {
        if (filter === "all") return true;
        return req.status.toLowerCase() === filter;
      }),
    [filter, leaveRequests],
  );

  const leaveDefaults = useMemo<ActionDialogValues>(
    () => ({
      teacher: "",
      department: "",
      leaveType: "Sick Leave",
      startDate: "2026-05-05",
      endDate: "2026-05-05",
      days: "1",
      reason: "",
      substitute: "",
      status: "Pending",
    }),
    [],
  );

  const handleLeaveSubmit = (values: ActionDialogValues) => {
    setLeaveRequests((current) => [
      {
        id: Date.now(),
        teacher: String(values.teacher ?? ""),
        department: String(values.department ?? ""),
        leaveType: String(values.leaveType ?? "Sick Leave"),
        startDate: String(values.startDate ?? ""),
        endDate: String(values.endDate ?? ""),
        days: Number(values.days ?? 1),
        reason: String(values.reason ?? ""),
        status: String(values.status ?? "Pending"),
        substitute: String(values.substitute ?? "").trim() || null,
      },
      ...current,
    ]);
  };

  const updateLeaveStatus = (id: number, status: string) => {
    setLeaveRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Leave Management System</h2>
        <button
          type="button"
          onClick={() => setLeaveDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Add />
          New Leave Request
        </button>
      </div>

      <ActionDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title="New Leave Request"
        description="Submit a leave request for a teacher."
        submitLabel="Create Request"
        initialValues={leaveDefaults}
        fields={[
          { name: "teacher", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          {
            name: "leaveType",
            label: "Leave Type",
            type: "select",
            options: [
              { label: "Sick Leave", value: "Sick Leave" },
              { label: "Annual Leave", value: "Annual Leave" },
              { label: "Emergency Leave", value: "Emergency Leave" },
              { label: "Maternity Leave", value: "Maternity Leave" },
            ],
          },
          { name: "startDate", label: "Start Date", type: "date" },
          { name: "endDate", label: "End Date", type: "date" },
          { name: "days", label: "Days", type: "number" },
          { name: "reason", label: "Reason", type: "textarea", rows: 3 },
          { name: "substitute", label: "Suggested Substitute", placeholder: "Optional" },
        ]}
        onSubmit={handleLeaveSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{leaveRequests.length}</p>
            </div>
            <HourglassEmpty className="text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {leaveRequests.filter((r) => r.status === "Pending").length}
              </p>
            </div>
            <HourglassEmpty className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {leaveRequests.filter((r) => r.status === "Approved").length}
              </p>
            </div>
            <CheckCircle className="text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {leaveRequests.filter((r) => r.status === "Rejected").length}
              </p>
            </div>
            <Cancel className="text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 rounded ${
                filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-3 py-1 rounded ${
                filter === "approved" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-3 py-1 rounded ${
                filter === "rejected" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{request.teacher}</h4>
                      <span className="text-sm text-gray-600">• {request.department}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : request.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium text-gray-900">{request.leaveType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-medium text-gray-900">
                          {request.startDate} to {request.endDate} ({request.days} days)
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reason</p>
                        <p className="font-medium text-gray-900">{request.reason}</p>
                      </div>
                      {request.substitute && (
                        <div>
                          <p className="text-gray-600">Substitute</p>
                          <p className="font-medium text-green-700">{request.substitute}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {request.status === "Pending" && (
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => updateLeaveStatus(request.id, "Approved")}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateLeaveStatus(request.id, "Rejected")}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Smart Substitute Assignment</h4>
        <p className="text-sm text-blue-800">
          When a leave is approved, the system automatically suggests suitable substitute teachers based on
          subject expertise, availability, and workload balance.
        </p>
      </div>
    </div>
  );
}
