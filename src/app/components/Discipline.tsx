import { useMemo, useState } from "react";
import { Add, Sms, Visibility } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type ComplaintRecord = {
  id: number;
  teacher: string;
  department: string;
  complaintType: string;
  complainant: string;
  date: string;
  severity: string;
  status: string;
  description: string;
  smsNotified: boolean;
};

export default function Discipline() {
  const [filter, setFilter] = useState("all");
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([
    {
      id: 1,
      teacher: "John Smith",
      department: "Mathematics",
      complaintType: "Student Complaint",
      complainant: "Sarah Parker (Student)",
      date: "2026-05-03",
      severity: "Medium",
      status: "Under Investigation",
      description: "Alleged unfair grading in mathematics exam",
      smsNotified: true,
    },
    {
      id: 2,
      teacher: "Michael Chen",
      department: "English",
      complaintType: "Behavioral Issue",
      complainant: "Admin Staff",
      date: "2026-04-28",
      severity: "Low",
      status: "Resolved",
      description: "Late submission of exam papers",
      smsNotified: true,
    },
    {
      id: 3,
      teacher: "Emma Williams",
      department: "History",
      complaintType: "Student Complaint",
      complainant: "Robert Johnson (Student)",
      date: "2026-05-01",
      severity: "High",
      status: "Action Taken",
      description: "Inappropriate classroom behavior reported",
      smsNotified: true,
    },
  ]);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);

  const filteredComplaints = useMemo(
    () =>
      complaints.filter((c) => {
        if (filter === "all") return true;
        return c.status.toLowerCase().replace(" ", "") === filter;
      }),
    [complaints, filter],
  );

  const complaintDefaults = useMemo<ActionDialogValues>(
    () => ({
      teacher: "",
      department: "",
      complaintType: "Student Complaint",
      complainant: "",
      date: "2026-05-05",
      severity: "Medium",
      status: "Under Investigation",
      description: "",
      smsNotified: true,
    }),
    [],
  );

  const handleComplaintSubmit = (values: ActionDialogValues) => {
    setComplaints((current) => [
      {
        id: Date.now(),
        teacher: String(values.teacher ?? ""),
        department: String(values.department ?? ""),
        complaintType: String(values.complaintType ?? "Student Complaint"),
        complainant: String(values.complainant ?? ""),
        date: String(values.date ?? ""),
        severity: String(values.severity ?? "Medium"),
        status: String(values.status ?? "Under Investigation"),
        description: String(values.description ?? ""),
        smsNotified: Boolean(values.smsNotified),
      },
      ...current,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Discipline Tracking</h2>
        <button
          type="button"
          onClick={() => setComplaintDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Add />
          Log New Complaint
        </button>
      </div>

      <ActionDialog
        open={complaintDialogOpen}
        onOpenChange={setComplaintDialogOpen}
        title="Log New Complaint"
        description="Record a disciplinary complaint against a teacher."
        submitLabel="Save Complaint"
        initialValues={complaintDefaults}
        fields={[
          { name: "teacher", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          {
            name: "complaintType",
            label: "Complaint Type",
            type: "select",
            options: [
              { label: "Student Complaint", value: "Student Complaint" },
              { label: "Behavioral Issue", value: "Behavioral Issue" },
              { label: "Admin Concern", value: "Admin Concern" },
            ],
          },
          { name: "complainant", label: "Complainant", placeholder: "Enter complainant" },
          { name: "date", label: "Date", type: "date" },
          {
            name: "severity",
            label: "Severity",
            type: "select",
            options: [
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Under Investigation", value: "Under Investigation" },
              { label: "Action Taken", value: "Action Taken" },
              { label: "Resolved", value: "Resolved" },
            ],
          },
          { name: "description", label: "Description", type: "textarea", rows: 3 },
          { name: "smsNotified", label: "SMS Notified", type: "checkbox" },
        ]}
        onSubmit={handleComplaintSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Complaints</p>
          <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Under Investigation</p>
          <p className="text-2xl font-bold text-yellow-600">
            {complaints.filter((c) => c.status === "Under Investigation").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Action Taken</p>
          <p className="text-2xl font-bold text-orange-600">
            {complaints.filter((c) => c.status === "Action Taken").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {complaints.filter((c) => c.status === "Resolved").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Complaints & Incidents</h3>
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
              onClick={() => setFilter("underinvestigation")}
              className={`px-3 py-1 rounded ${
                filter === "underinvestigation" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Investigating
            </button>
            <button
              onClick={() => setFilter("actiontaken")}
              className={`px-3 py-1 rounded ${
                filter === "actiontaken" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Action Taken
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-3 py-1 rounded ${
                filter === "resolved" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{complaint.teacher}</h4>
                      <span className="text-sm text-gray-600">• {complaint.department}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          complaint.severity === "High"
                            ? "bg-red-100 text-red-700"
                            : complaint.severity === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {complaint.severity} Severity
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          complaint.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : complaint.status === "Action Taken"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {complaint.status}
                      </span>
                      {complaint.smsNotified && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Sms fontSize="small" />
                          SMS Sent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3 font-medium">{complaint.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium text-gray-900">{complaint.complaintType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Complainant</p>
                        <p className="font-medium text-gray-900">{complaint.complainant}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">{complaint.date}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(complaint)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded ml-4"
                  >
                    <Visibility />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedComplaint && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">Selected Complaint</h4>
          <p className="text-sm text-red-800">
            {selectedComplaint.teacher} - {selectedComplaint.status} - {selectedComplaint.description}
          </p>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Student Complaint Workflow</h4>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• Complaint is formally tagged to the teacher's record</li>
          <li>• Automated SMS notification sent to concerned parties upon registration</li>
          <li>• Investigation process initiated and tracked</li>
        </ul>
      </div>
    </div>
  );
}
