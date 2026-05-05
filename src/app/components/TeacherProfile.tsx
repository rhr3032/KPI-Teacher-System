import { useMemo, useState } from "react";
import { Add, Download, Edit, Search, Visibility } from "@mui/icons-material";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type TeacherRecord = {
  id: number;
  name: string;
  department: string;
  subject: string;
  type: string;
  joiningDate: string;
  experience: string;
  academicQualification: string;
  institutionName: string;
  cgpa: string;
  certificateNames: string[];
  appointmentLetterFileName: string;
  appointmentLetterContent: string;
};

function formatDateLabel(dateValue: string) {
  if (!dateValue) {
    return "-";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();
}

function buildAppointmentLetter(teacher: TeacherRecord) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Appointment Letter - ${teacher.name}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; padding: 48px; }
      .letter { max-width: 760px; margin: 0 auto; border: 1px solid #dbeafe; padding: 36px; border-radius: 18px; }
      .header { text-align: center; margin-bottom: 32px; }
      h1 { color: #1d4ed8; margin: 0 0 8px; font-size: 28px; }
      h2 { margin: 24px 0 12px; font-size: 18px; color: #111827; }
      p { margin: 0 0 12px; }
      .meta { background: #eff6ff; padding: 16px 20px; border-radius: 12px; margin: 20px 0; }
      .footer { margin-top: 36px; }
      .signature { margin-top: 56px; }
    </style>
  </head>
  <body>
    <div class="letter">
      <div class="header">
        <h1>Appointment Letter</h1>
        <p>KPI Teacher System</p>
      </div>
      <p>Date: ${formatDateLabel(teacher.joiningDate)}</p>
      <p>Dear ${teacher.name},</p>
      <p>
        We are pleased to appoint you as a ${teacher.type.toLowerCase()} teacher in the ${teacher.department} department,
        teaching ${teacher.subject}.
      </p>
      <div class="meta">
        <h2>Candidate Details</h2>
        <p><strong>Academic Qualification:</strong> ${teacher.academicQualification || "-"}</p>
        <p><strong>Institution Name:</strong> ${teacher.institutionName || "-"}</p>
        <p><strong>CGPA:</strong> ${teacher.cgpa || "-"}</p>
        <p><strong>Experience:</strong> ${teacher.experience || "-"}</p>
        <p><strong>Certificates Submitted:</strong> ${teacher.certificateNames.length ? teacher.certificateNames.join(", ") : "None"}</p>
      </div>
      <h2>Terms of Appointment</h2>
      <p>
        Your joining date is ${formatDateLabel(teacher.joiningDate)}. You are expected to follow institutional policies,
        maintain professional conduct, and perform your assigned duties responsibly.
      </p>
      <p>
        Please keep this appointment letter as part of your employment record.
      </p>
      <div class="signature">
        <p>Sincerely,</p>
        <p><strong>Administration</strong></p>
        <p>KPI Teacher System</p>
      </div>
    </div>
  </body>
</html>`;
}

function downloadAppointmentLetter(teacher: TeacherRecord) {
  const blob = new Blob([teacher.appointmentLetterContent], { type: "application/msword" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = teacher.appointmentLetterFileName;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

export default function TeacherProfile() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [teachers, setTeachers] = useState<TeacherRecord[]>(
    [
    {
      id: 1,
      name: "John Smith",
      department: "Mathematics",
      subject: "Algebra, Calculus",
      type: "Full-time",
      joiningDate: "2020-08-15",
      experience: "5 years",
      academicQualification: "MSc in Mathematics",
      institutionName: "KPI University",
      cgpa: "3.78",
      certificateNames: ["MSc Certificate.pdf", "Teaching License.pdf"],
      appointmentLetterFileName: "john-smith-appointment-letter.doc",
      appointmentLetterContent: "",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      department: "Science",
      subject: "Physics, Chemistry",
      type: "Full-time",
      joiningDate: "2019-01-10",
      experience: "7 years",
      academicQualification: "MSc in Physics",
      institutionName: "National Science College",
      cgpa: "3.91",
      certificateNames: ["Degree Certificate.pdf"],
      appointmentLetterFileName: "sarah-johnson-appointment-letter.doc",
      appointmentLetterContent: "",
    },
    {
      id: 3,
      name: "Michael Chen",
      department: "English",
      subject: "Literature, Grammar",
      type: "Part-time",
      joiningDate: "2022-03-20",
      experience: "3 years",
      academicQualification: "MA in English Literature",
      institutionName: "Central Arts College",
      cgpa: "3.64",
      certificateNames: ["MA Certificate.pdf"],
      appointmentLetterFileName: "michael-chen-appointment-letter.doc",
      appointmentLetterContent: "",
    },
    {
      id: 4,
      name: "Emma Williams",
      department: "History",
      subject: "World History",
      type: "Contract",
      joiningDate: "2023-09-01",
      experience: "2 years",
      academicQualification: "BA in History",
      institutionName: "City College",
      cgpa: "3.55",
      certificateNames: ["BA Certificate.pdf"],
      appointmentLetterFileName: "emma-williams-appointment-letter.doc",
      appointmentLetterContent: "",
    },
    ].map((teacher) => ({
      ...teacher,
      appointmentLetterContent: buildAppointmentLetter(teacher),
    })),
  );
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
      academicQualification: editingTeacher?.academicQualification ?? "",
      institutionName: editingTeacher?.institutionName ?? "",
      cgpa: editingTeacher?.cgpa ?? "",
      certificates: [],
    }),
    [editingTeacher],
  );

  const handleTeacherSubmit = (values: ActionDialogValues) => {
    const uploadedCertificates = Array.isArray(values.certificates) ? values.certificates : [];
    const certificateNames = uploadedCertificates.map((file) => file.name);
    const nextCertificateNames = uploadedCertificates.length > 0 ? certificateNames : editingTeacher?.certificateNames ?? [];
    const payload: TeacherRecord = {
      id: editingTeacher?.id ?? Date.now(),
      name: String(values.name ?? ""),
      department: String(values.department ?? ""),
      subject: String(values.subject ?? ""),
      type: String(values.type ?? "Full-time"),
      joiningDate: String(values.joiningDate ?? ""),
      experience: String(values.experience ?? ""),
      academicQualification: String(values.academicQualification ?? ""),
      institutionName: String(values.institutionName ?? ""),
      cgpa: String(values.cgpa ?? ""),
      certificateNames: nextCertificateNames,
      appointmentLetterFileName: `${sanitizeFileName(String(values.name ?? "teacher") || "teacher")}-appointment-letter.doc`,
      appointmentLetterContent: "",
    };

    payload.appointmentLetterContent = buildAppointmentLetter(payload);

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
          { name: "academicQualification", label: "Academic Qualification", placeholder: "e.g. MEd in Education" },
          { name: "institutionName", label: "Institution Name", placeholder: "Enter institution name" },
          { name: "cgpa", label: "CGPA", placeholder: "e.g. 3.75" },
          {
            name: "certificates",
            label: "Upload Certificates",
            type: "file",
            accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
            multiple: true,
          },
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedTeacher(teacher)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View teacher"
                      >
                        <Visibility fontSize="small" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditTeacherDialog(teacher)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit teacher"
                      >
                        <Edit fontSize="small" />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadAppointmentLetter(teacher)}
                        className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        title="Download appointment letter"
                      >
                        <Download fontSize="small" />
                        Letter
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
          <p className="text-sm text-blue-800">{selectedTeacher.name} - {selectedTeacher.department} - {selectedTeacher.subject}</p>
          <p className="text-sm text-blue-800 mt-1">
            Qualification: {selectedTeacher.academicQualification || "-"} | Institution: {selectedTeacher.institutionName || "-"} | CGPA: {selectedTeacher.cgpa || "-"}
          </p>
          <p className="text-sm text-blue-800 mt-1">
            Certificates: {selectedTeacher.certificateNames.length ? selectedTeacher.certificateNames.join(", ") : "None"}
          </p>
        </div>
      )}
    </div>
  );
}
