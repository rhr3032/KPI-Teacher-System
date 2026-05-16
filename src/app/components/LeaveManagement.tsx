import { useMemo, useState } from "react";
import { CheckCircle, Cancel, HourglassEmpty } from "@mui/icons-material";
import { loadLeaveRequests, saveLeaveRequests } from "../leave-requests-store";

export default function LeaveManagement() {
  const [filter, setFilter] = useState("all");
  const [leaveRequests, setLeaveRequests] = useState(() => loadLeaveRequests());

  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter((req) => {
        if (filter === "all") return true;
        return req.status.toLowerCase() === filter;
      }),
    [filter, leaveRequests],
  );

  const updateLeaveStatus = (id: number, status: string) => {
    setLeaveRequests((current) => {
      const next = current.map((request) => (request.id === id ? { ...request, status } : request));
      saveLeaveRequests(next);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Leave Management System</h2>
      </div>

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
