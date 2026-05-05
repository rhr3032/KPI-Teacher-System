import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Assessment, Visibility } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type EvaluationRecord = {
  id: number;
  name: string;
  department: string;
  overallScore: number;
  teaching: number;
  punctuality: number;
  engagement: number;
  status: string;
  reviewer: string;
};

export default function Performance() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([
    {
      id: 1,
      name: "John Smith",
      department: "Mathematics",
      overallScore: 88,
      teaching: 90,
      punctuality: 85,
      engagement: 88,
      status: "Completed",
      reviewer: "Principal",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      department: "Science",
      overallScore: 92,
      teaching: 94,
      punctuality: 90,
      engagement: 92,
      status: "Completed",
      reviewer: "Principal",
    },
    {
      id: 3,
      name: "Michael Chen",
      department: "English",
      overallScore: 85,
      teaching: 87,
      punctuality: 83,
      engagement: 85,
      status: "In Progress",
      reviewer: "Admin",
    },
  ]);
  const [newEvaluationOpen, setNewEvaluationOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationRecord | null>(null);

  const performanceData = [
    {
      month: "Jan",
      teaching: 85,
      punctuality: 90,
      studentEngagement: 88,
      professionalism: 92,
    },
    {
      month: "Feb",
      teaching: 88,
      punctuality: 92,
      studentEngagement: 90,
      professionalism: 94,
    },
    {
      month: "Mar",
      teaching: 90,
      punctuality: 95,
      studentEngagement: 92,
      professionalism: 96,
    },
  ];

  const evaluationDefaults = useMemo<ActionDialogValues>(
    () => ({
      name: "",
      department: "",
      overallScore: "90",
      teaching: "90",
      punctuality: "90",
      engagement: "90",
      status: "In Progress",
      reviewer: "Principal",
    }),
    [],
  );

  const handleEvaluationSubmit = (values: ActionDialogValues) => {
    const overallScore = Number(values.overallScore ?? 0);
    const teaching = Number(values.teaching ?? 0);
    const punctuality = Number(values.punctuality ?? 0);
    const engagement = Number(values.engagement ?? 0);

    setEvaluations((current) => [
      {
        id: Date.now(),
        name: String(values.name ?? ""),
        department: String(values.department ?? ""),
        overallScore,
        teaching,
        punctuality,
        engagement,
        status: String(values.status ?? "In Progress"),
        reviewer: String(values.reviewer ?? "Principal"),
      },
      ...current,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance & Evaluation (ACR)</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <button
            type="button"
            onClick={() => setNewEvaluationOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Assessment />
            New Evaluation
          </button>
        </div>
      </div>

      <ActionDialog
        open={newEvaluationOpen}
        onOpenChange={setNewEvaluationOpen}
        title="New Evaluation"
        description="Record a new annual confidential review for a teacher."
        submitLabel="Create Evaluation"
        initialValues={evaluationDefaults}
        fields={[
          { name: "name", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          { name: "overallScore", label: "Overall Score", type: "number" },
          { name: "teaching", label: "Teaching Score", type: "number" },
          { name: "punctuality", label: "Punctuality Score", type: "number" },
          { name: "engagement", label: "Engagement Score", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "In Progress", value: "In Progress" },
              { label: "Completed", value: "Completed" },
            ],
          },
          { name: "reviewer", label: "Reviewer", placeholder: "Principal or Admin" },
        ]}
        onSubmit={handleEvaluationSubmit}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends - {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="teaching" fill="#3b82f6" name="Teaching Quality" />
            <Bar dataKey="punctuality" fill="#10b981" name="Punctuality" />
            <Bar dataKey="studentEngagement" fill="#f59e0b" name="Student Engagement" />
            <Bar dataKey="professionalism" fill="#8b5cf6" name="Professionalism" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">ACR Evaluations - {selectedYear}</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Overall Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teaching</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Punctuality</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Engagement</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {evaluations.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{teacher.name}</td>
                    <td className="py-3 px-4 text-gray-700">{teacher.department}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${teacher.overallScore}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900">{teacher.overallScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{teacher.teaching}%</td>
                    <td className="py-3 px-4 text-gray-700">{teacher.punctuality}%</td>
                    <td className="py-3 px-4 text-gray-700">{teacher.engagement}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          teacher.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedEvaluation(teacher)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Visibility fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedEvaluation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Evaluation</h4>
          <p className="text-sm text-blue-800">
            {selectedEvaluation.name} ({selectedEvaluation.department}) - {selectedEvaluation.overallScore}% overall, reviewed by {selectedEvaluation.reviewer}.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ACR Remark Types & Privacy</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Confidential:</strong> Visible only to Principal</li>
          <li>• <strong>Internal:</strong> Visible to Admin and HR staff</li>
          <li>• <strong>General:</strong> Visible to the evaluated teacher</li>
        </ul>
      </div>
    </div>
  );
}
