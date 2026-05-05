import { useMemo, useState } from "react";
import { Add, CheckCircle, HourglassEmpty, Error } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type TaskRecord = {
  id: number;
  title: string;
  category: string;
  assignedTo: string;
  deadline: string;
  status: string;
  priority: string;
  description: string;
};

export default function TaskManagement() {
  const [filter, setFilter] = useState("all");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskRecord[]>([
    {
      id: 1,
      title: "Examination Duty - Mid-Term",
      category: "Examination",
      assignedTo: "John Smith, Sarah Johnson",
      deadline: "2026-05-12",
      status: "Pending",
      priority: "High",
      description: "Supervise mid-term examinations for Grade 10",
    },
    {
      id: 2,
      title: "Annual Day Event Coordination",
      category: "Event",
      assignedTo: "Michael Chen",
      deadline: "2026-05-20",
      status: "Ongoing",
      priority: "Medium",
      description: "Coordinate annual day cultural programs",
    },
    {
      id: 3,
      title: "Library Inventory Audit",
      category: "Administrative",
      assignedTo: "Emma Williams",
      deadline: "2026-05-08",
      status: "Completed",
      priority: "Low",
      description: "Complete library book inventory and update records",
    },
    {
      id: 4,
      title: "Parent-Teacher Meeting Setup",
      category: "Administrative",
      assignedTo: "John Smith, Emma Williams",
      deadline: "2026-05-15",
      status: "Ongoing",
      priority: "High",
      description: "Organize parent-teacher meeting arrangements",
    },
  ]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "all") return true;
        return task.status.toLowerCase() === filter;
      }),
    [filter, tasks],
  );

  const taskDefaults = useMemo<ActionDialogValues>(
    () => ({
      title: "",
      category: "Administrative",
      assignedTo: "",
      deadline: "2026-05-05",
      status: "Pending",
      priority: "Medium",
      description: "",
    }),
    [],
  );

  const handleTaskSubmit = (values: ActionDialogValues) => {
    setTasks((current) => [
      {
        id: Date.now(),
        title: String(values.title ?? ""),
        category: String(values.category ?? "Administrative"),
        assignedTo: String(values.assignedTo ?? ""),
        deadline: String(values.deadline ?? ""),
        status: String(values.status ?? "Pending"),
        priority: String(values.priority ?? "Medium"),
        description: String(values.description ?? ""),
      },
      ...current,
    ]);
  };

  const updateTaskStatus = (id: number, status: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Task & Responsibility Management</h2>
        <button
          type="button"
          onClick={() => setTaskDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Add />
          Assign New Task
        </button>
      </div>

      <ActionDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        title="Assign New Task"
        description="Create a responsibility and assign it to staff members."
        submitLabel="Create Task"
        initialValues={taskDefaults}
        fields={[
          { name: "title", label: "Task Title", placeholder: "Enter task title" },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "Examination", value: "Examination" },
              { label: "Event", value: "Event" },
              { label: "Administrative", value: "Administrative" },
            ],
          },
          { name: "assignedTo", label: "Assigned To", placeholder: "Comma-separated names" },
          { name: "deadline", label: "Deadline", type: "date" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Pending", value: "Pending" },
              { label: "Ongoing", value: "Ongoing" },
              { label: "Completed", value: "Completed" },
            ],
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: [
              { label: "High", value: "High" },
              { label: "Medium", value: "Medium" },
              { label: "Low", value: "Low" },
            ],
          },
          { name: "description", label: "Description", type: "textarea", rows: 3 },
        ]}
        onSubmit={handleTaskSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <HourglassEmpty className="text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tasks.filter((t) => t.status === "Pending").length}
              </p>
            </div>
            <Error className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === "Ongoing").length}
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
                {tasks.filter((t) => t.status === "Completed").length}
              </p>
            </div>
            <CheckCircle className="text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
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
              onClick={() => setFilter("ongoing")}
              className={`px-3 py-1 rounded ${
                filter === "ongoing" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded ${
                filter === "completed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          task.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "Ongoing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Category</p>
                        <p className="font-medium text-gray-900">{task.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Assigned To</p>
                        <p className="font-medium text-gray-900">{task.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Deadline</p>
                        <p className="font-medium text-gray-900">{task.deadline}</p>
                      </div>
                    </div>
                  </div>
                  {task.status !== "Completed" && (
                    <div className="flex gap-2 ml-4">
                      {task.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, "Ongoing")}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Start
                        </button>
                      )}
                      {task.status === "Ongoing" && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, "Completed")}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Task Categories</h4>
        <div className="flex gap-4 text-sm text-gray-700">
          <div>• Examination Duty</div>
          <div>• Event Management</div>
          <div>• Administrative Work</div>
        </div>
      </div>
    </div>
  );
}
