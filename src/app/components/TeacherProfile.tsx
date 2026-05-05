import { useMemo, useState } from "react";
import { Add, Search, Edit, Visibility } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type TeacherRecord = {
  id: number;
  name: string;
  department: string;
  subject: string;
  type: string;
  joiningDate: string;
  experience: string;
};

export default function TeacherProfile() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [teachers, setTeachers] = useState<TeacherRecord[]>([
    {
      id: 1,
      name: "John Smith",
      department: "Mathematics",
      subject: "Algebra, Calculus",
      type: "Full-time",
      joiningDate: "2020-08-15",
      experience: "5 years",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      department: "Science",
      subject: "Physics, Chemistry",
      type: "Full-time",
      joiningDate: "2019-01-10",
      experience: "7 years",
    },
    {
      id: 3,
      name: "Michael Chen",
      department: "English",
      subject: "Literature, Grammar",
      type: "Part-time",
      joiningDate: "2022-03-20",
      experience: "3 years",
    },
    {
      id: 4,
      name: "Emma Williams",
      department: "History",
      subject: "World History",
      type: "Contract",
      joiningDate: "2023-09-01",
      experience: "2 years",
    },
  ]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(null);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          teacher.name.toLowerCase().includes(query) ||
          teacher.department.toLowerCase().includes(query) ||
          teacher.subject.toLowerCase().includes(query);
        const matchesDepartment = !departmentFilter || teacher.department === departmentFilter;
        const matchesType = !typeFilter || teacher.type === typeFilter;

        return matchesSearch && matchesDepartment && matchesType;
      }),
    [departmentFilter, searchTerm, teachers, typeFilter],
  );

  const teacherFormValues = useMemo<ActionDialogValues>(
    () => ({
      name: editingTeacher?.name ?? "",
      department: editingTeacher?.department ?? "",
      subject: editingTeacher?.subject ?? "",
      type: editingTeacher?.type ?? "Full-time",
      joiningDate: editingTeacher?.joiningDate ?? "",
      experience: editingTeacher?.experience ?? "",
    }),
    [editingTeacher],
  );

  const handleTeacherSubmit = (values: ActionDialogValues) => {
    const payload: TeacherRecord = {
      id: editingTeacher?.id ?? Date.now(),
      name: String(values.name ?? ""),
      department: String(values.department ?? ""),
      subject: String(values.subject ?? ""),
      type: String(values.type ?? "Full-time"),
      joiningDate: String(values.joiningDate ?? ""),
      experience: String(values.experience ?? ""),
    };

    setTeachers((current) =>
      editingTeacher
        ? current.map((teacher) => (teacher.id === editingTeacher.id ? payload : teacher))
        : [payload, ...current],
    );
    setSelectedTeacher(payload);
    setEditingTeacher(null);
  };

  const openNewTeacherDialog = () => {
    setEditingTeacher(null);
    setTeacherDialogOpen(true);
  };

  const openEditTeacherDialog = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher);
    setTeacherDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Profiles</h2>
        <button
          type="button"
          onClick={openNewTeacherDialog}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Add />
          Add New Teacher
        </button>
      </div>

      <ActionDialog
        open={teacherDialogOpen}
        onOpenChange={setTeacherDialogOpen}
        title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}
        description={editingTeacher ? "Update the teacher profile details." : "Create a new teacher profile record."}
        submitLabel={editingTeacher ? "Save Changes" : "Create Teacher"}
        initialValues={teacherFormValues}
        fields={[
          { name: "name", label: "Full Name", placeholder: "Enter teacher name" },
          { name: "department", label: "Department", placeholder: "Enter department" },
          { name: "subject", label: "Subject(s)", placeholder: "Enter subjects taught" },
          {
            name: "type",
            label: "Teacher Type",
            type: "select",
            options: [
              { label: "Full-time", value: "Full-time" },
              { label: "Part-time", value: "Part-time" },
              { label: "Contract", value: "Contract" },
            ],
          },
          { name: "joiningDate", label: "Joining Date", type: "date" },
          { name: "experience", label: "Experience", placeholder: "e.g. 5 years" },
        ]}
        onSubmit={handleTeacherSubmit}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, department, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joining Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Experience</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{teacher.name}</td>
                  <td className="py-3 px-4 text-gray-700">{teacher.department}</td>
                  <td className="py-3 px-4 text-gray-700">{teacher.subject}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        teacher.type === "Full-time"
                          ? "bg-green-100 text-green-700"
                          : teacher.type === "Part-time"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {teacher.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{teacher.joiningDate}</td>
                  <td className="py-3 px-4 text-gray-700">{teacher.experience}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTeacher(teacher)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Visibility fontSize="small" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditTeacherDialog(teacher)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTeacher && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Teacher</h3>
          <p className="text-sm text-blue-800">
            {selectedTeacher.name} - {selectedTeacher.department} - {selectedTeacher.subject}
          </p>
        </div>
      )}
    </div>
  );
}
