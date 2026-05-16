import { useMemo, useState } from "react";
import { EventNote } from "@mui/icons-material";
import { useAuth } from "../auth";
import { loadLeaveRequests, saveLeaveRequests, type LeaveRequest } from "../leave-requests-store";

function calculateLeaveDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
}

export default function TeacherPortal() {
  const { session } = useAuth();
  const [department, setDepartment] = useState("General");
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [startDate, setStartDate] = useState("2026-05-16");
  const [endDate, setEndDate] = useState("2026-05-16");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>(() => loadLeaveRequests());

  const myRequests = useMemo(
    () => allRequests.filter((request) => request.teacher === session.name),
    [allRequests, session.name],
  );

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const days = calculateLeaveDays(startDate, endDate);
    if (days <= 0) {
      setNotice("Please select a valid leave date range.");
      return;
    }

    if (!reason.trim()) {
      setNotice("Please enter a reason for leave.");
      return;
    }

    const nextRequest: LeaveRequest = {
      id: Date.now(),
      teacher: session.name,
      department,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
      status: "Pending",
      substitute: null,
      createdBy: "teacher",
    };

    const next = [nextRequest, ...allRequests];
    setAllRequests(next);
    saveLeaveRequests(next);
    setReason("");
    setNotice("Leave request submitted. Admin can now review it in Leave Management.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Leave Portal</h2>
          <p className="text-sm text-gray-600">Submit your leave request and track approval status.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          Logged in as {session.name}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <EventNote className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Request Leave</h3>
        </div>

        <form onSubmit={submitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            Department
            <input
              type="text"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your department"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Leave Type
            <select
              value={leaveType}
              onChange={(event) => setLeaveType(event.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="md:col-span-2 text-sm font-medium text-gray-700">
            Reason
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for leave"
            />
          </label>

          <div className="md:col-span-2 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total days: {calculateLeaveDays(startDate, endDate) || 0}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Leave Request
            </button>
          </div>
        </form>

        {notice ? <p className="mt-4 text-sm text-blue-700">{notice}</p> : null}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Leave Requests</h3>
        <div className="space-y-3">
          {myRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{request.leaveType}</p>
                  <p className="text-sm text-gray-600">
                    {request.startDate} to {request.endDate} ({request.days} days)
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    request.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : request.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{request.reason}</p>
            </div>
          ))}
          {myRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No leave requests submitted yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
