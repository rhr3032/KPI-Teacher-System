import { useMemo, useState } from "react";
import { WbSunny, LightMode, NightsStay, SwapHoriz } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type ShiftAssignment = {
  id: number;
  teacher: string;
  department: string;
  currentShift: string;
  shiftTime: string;
  status: string;
  changeRequest: string | null;
};

type ShiftRequest = {
  id: number;
  teacher: string;
  currentShift: string;
  requestedShift: string;
  reason: string;
  requestDate: string;
  status: string;
};

export default function ShiftManagement() {
  const [selectedShift, setSelectedShift] = useState("all");
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([
    {
      id: 1,
      teacher: "John Smith",
      department: "Mathematics",
      currentShift: "Morning",
      shiftTime: "8:00 AM - 1:00 PM",
      status: "Active",
      changeRequest: null,
    },
    {
      id: 2,
      teacher: "Sarah Johnson",
      department: "Science",
      currentShift: "Day",
      shiftTime: "1:00 PM - 6:00 PM",
      status: "Active",
      changeRequest: null,
    },
    {
      id: 3,
      teacher: "Michael Chen",
      department: "English",
      currentShift: "Morning",
      shiftTime: "8:00 AM - 1:00 PM",
      status: "Pending Change",
      changeRequest: "Requested Day shift",
    },
    {
      id: 4,
      teacher: "Emma Williams",
      department: "History",
      currentShift: "Evening",
      shiftTime: "4:00 PM - 9:00 PM",
      status: "Active",
      changeRequest: null,
    },
  ]);
  const [changeRequests, setChangeRequests] = useState<ShiftRequest[]>([
    {
      id: 1,
      teacher: "Michael Chen",
      currentShift: "Morning",
      requestedShift: "Day",
      reason: "Personal commitment in morning hours",
      requestDate: "2026-05-02",
      status: "Pending",
    },
    {
      id: 2,
      teacher: "Robert Brown",
      currentShift: "Evening",
      requestedShift: "Morning",
      reason: "Health reasons - need early shift",
      requestDate: "2026-04-28",
      status: "Approved",
    },
  ]);
  const [assignShiftOpen, setAssignShiftOpen] = useState(false);

  const shiftTimes: Record<string, string> = {
    Morning: "8:00 AM - 1:00 PM",
    Day: "1:00 PM - 6:00 PM",
    Evening: "4:00 PM - 9:00 PM",
  };

  const filteredAssignments = useMemo(
    () =>
      assignments.filter((a) => {
        if (selectedShift === "all") return true;
        return a.currentShift.toLowerCase() === selectedShift;
      }),
    [assignments, selectedShift],
  );

  const assignmentDefaults = useMemo<ActionDialogValues>(
    () => ({
      teacher: "",
      department: "",
      currentShift: "Morning",
      shiftTime: shiftTimes.Morning,
      status: "Active",
    }),
    [],
  );

  const handleAssignmentSubmit = (values: ActionDialogValues) => {
    const currentShift = String(values.currentShift ?? "Morning");
    setAssignments((current) => [
      {
        id: Date.now(),
        teacher: String(values.teacher ?? ""),
        department: String(values.department ?? ""),
        currentShift,
        shiftTime: String(values.shiftTime ?? shiftTimes[currentShift] ?? ""),
        status: String(values.status ?? "Active"),
        changeRequest: null,
      },
      ...current,
    ]);
  };

  const applyRequestDecision = (requestId: number, status: string) => {
    const request = changeRequests.find((item) => item.id === requestId);

    setChangeRequests((current) =>
      current.map((item) => (item.id === requestId ? { ...item, status } : item)),
    );

    if (status === "Approved" && request) {
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.teacher === request.teacher
            ? {
                ...assignment,
                currentShift: request.requestedShift,
                shiftTime: shiftTimes[request.requestedShift] ?? assignment.shiftTime,
                status: "Active",
                changeRequest: `Approved ${request.requestedShift} shift`,
              }
            : assignment,
        ),
      );
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift.toLowerCase()) {
      case "morning":
        return <WbSunny className="text-yellow-500" />;
      case "day":
        return <LightMode className="text-orange-500" />;
      case "evening":
        return <NightsStay className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
        <button
          type="button"
          onClick={() => setAssignShiftOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <SwapHoriz />
          Assign Shift
        </button>
      </div>

      <ActionDialog
        open={assignShiftOpen}
        onOpenChange={setAssignShiftOpen}
        title="Assign Shift"
        description="Assign a teacher to a new shift slot."
        submitLabel="Save Assignment"
        initialValues={assignmentDefaults}
        fields={[
          { name: "teacher", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          {
            name: "currentShift",
            label: "Current Shift",
            type: "select",
            options: [
              { label: "Morning", value: "Morning" },
              { label: "Day", value: "Day" },
              { label: "Evening", value: "Evening" },
            ],
          },
          { name: "shiftTime", label: "Shift Time", placeholder: "8:00 AM - 1:00 PM" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "Active" },
              { label: "Pending Change", value: "Pending Change" },
            ],
          },
        ]}
        onSubmit={handleAssignmentSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Morning Shift</p>
            <WbSunny className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {assignments.filter((a) => a.currentShift === "Morning").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">8:00 AM - 1:00 PM</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Day Shift</p>
            <LightMode className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {assignments.filter((a) => a.currentShift === "Day").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">1:00 PM - 6:00 PM</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Evening Shift</p>
            <NightsStay className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {assignments.filter((a) => a.currentShift === "Evening").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">4:00 PM - 9:00 PM</p>
        </div>
      </div>

        <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Shift Assignments</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedShift("all")}
              className={`px-3 py-1 rounded ${
                selectedShift === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedShift("morning")}
              className={`px-3 py-1 rounded ${
                selectedShift === "morning" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Morning
            </button>
            <button
              onClick={() => setSelectedShift("day")}
              className={`px-3 py-1 rounded ${
                selectedShift === "day" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setSelectedShift("evening")}
              className={`px-3 py-1 rounded ${
                selectedShift === "evening" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Evening
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Shift</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Shift Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Change Request</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{assignment.teacher}</td>
                    <td className="py-3 px-4 text-gray-700">{assignment.department}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getShiftIcon(assignment.currentShift)}
                        <span className="font-medium">{assignment.currentShift}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{assignment.shiftTime}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          assignment.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {assignment.changeRequest || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Shift Change Requests</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {changeRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{request.teacher}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <div className="flex items-center gap-2">
                        {getShiftIcon(request.currentShift)}
                        <span className="font-medium">{request.currentShift}</span>
                      </div>
                      <SwapHoriz className="text-gray-400" />
                      <div className="flex items-center gap-2">
                        {getShiftIcon(request.requestedShift)}
                        <span className="font-medium">{request.requestedShift}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p className="text-xs text-gray-500">Requested on: {request.requestDate}</p>
                  </div>
                  {request.status === "Pending" && (
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => applyRequestDecision(request.id, "Approved")}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRequestDecision(request.id, "Rejected")}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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
    </div>
  );
}
