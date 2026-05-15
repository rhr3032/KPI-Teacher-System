import { useState } from "react";
import { Add } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type ResignCase = {
  id: number;
  teacher: string;
  department: string;
  exitDate: string;
};

export default function ResignManagement() {
  const [resignCases, setResignCases] = useState<ResignCase[]>([
    { id: 1, teacher: "Robert Brown", department: "Physics", exitDate: "2026-05-31" },
    { id: 2, teacher: "Lisa Anderson", department: "Chemistry", exitDate: "2026-04-30" },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const defaults = {
    teacher: "",
    department: "",
    exitDate: new Date().toISOString().slice(0, 10),
  } as ActionDialogValues;

  const handleSubmit = (values: ActionDialogValues) => {
    setResignCases((current) => [
      {
        id: Date.now(),
        teacher: String(values.teacher ?? ""),
        department: String(values.department ?? ""),
        exitDate: String(values.exitDate ?? ""),
      },
      ...current,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Resign Management</h2>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Add />
          New Resignation
        </button>
      </div>

      <ActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Record Resignation"
        description="Add a teacher resignation with exit date."
        submitLabel="Save"
        initialValues={defaults}
        fields={[
          { name: "teacher", label: "Teacher Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          { name: "exitDate", label: "Exit Date", type: "date" },
        ]}
        onSubmit={handleSubmit}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resignations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {resignCases.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{c.teacher}</h4>
                    <p className="text-sm text-gray-600">{c.department}</p>
                  </div>
                  <div className="text-sm text-gray-700">{c.exitDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
