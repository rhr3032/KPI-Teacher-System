import { Add, Badge, Edit, Groups, Search, Visibility, Work } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { ActionDialog, type ActionDialogValues } from "./ui/ActionDialog";

type StaffRecord = {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  nationalId: string;
  status: string;
};

export default function StuffManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>([
    {
      id: 1,
      employeeId: "HR-1001",
      name: "John Smith",
      department: "Administration",
      designation: "HR Officer",
      joiningDate: "2020-08-15",
      phone: "+1-555-0101",
      email: "john.smith@hrms.edu",
      address: "12 Hill Street, Main City",
      gender: "Male",
      nationalId: "NI-1001-2201",
      status: "Active",
    },
    {
      id: 2,
      employeeId: "HR-1002",
      name: "Sarah Johnson",
      department: "Accounts",
      designation: "Payroll Assistant",
      joiningDate: "2021-02-10",
      phone: "+1-555-0102",
      email: "sarah.johnson@hrms.edu",
      address: "89 Lake Road, Central District",
      gender: "Female",
      nationalId: "NI-1002-2202",
      status: "Active",
    },
    {
      id: 3,
      employeeId: "HR-1003",
      name: "Michael Chen",
      department: "IT",
      designation: "Systems Support",
      joiningDate: "2022-05-01",
      phone: "+1-555-0103",
      email: "michael.chen@hrms.edu",
      address: "44 River Avenue, West Side",
      gender: "Male",
      nationalId: "NI-1003-2203",
      status: "On Leave",
    },
  ]);

  const filteredStaff = useMemo(
    () =>
      staffRecords.filter((staff) => {
        const query = searchTerm.toLowerCase();
        return (
          staff.name.toLowerCase().includes(query) ||
          staff.employeeId.toLowerCase().includes(query) ||
          staff.department.toLowerCase().includes(query) ||
          staff.designation.toLowerCase().includes(query)
        );
      }),
    [searchTerm, staffRecords],
  );

  const staffFormValues = useMemo<ActionDialogValues>(
    () => ({
      employeeId: editingStaff?.employeeId ?? "",
      name: editingStaff?.name ?? "",
      department: editingStaff?.department ?? "",
      designation: editingStaff?.designation ?? "",
      joiningDate: editingStaff?.joiningDate ?? "",
      phone: editingStaff?.phone ?? "",
      email: editingStaff?.email ?? "",
      address: editingStaff?.address ?? "",
      gender: editingStaff?.gender ?? "Male",
      nationalId: editingStaff?.nationalId ?? "",
      status: editingStaff?.status ?? "Active",
    }),
    [editingStaff],
  );

  const openNewStaffDialog = () => {
    setEditingStaff(null);
    setStaffDialogOpen(true);
  };

  const openEditStaffDialog = (staff: StaffRecord) => {
    setEditingStaff(staff);
    setStaffDialogOpen(true);
  };

  const viewStaffProfile = (staff: StaffRecord) => {
    setEditingStaff(staff);
    setStaffDialogOpen(true);
  };

  const handleStaffSubmit = (values: ActionDialogValues) => {
    const payload: StaffRecord = {
      id: editingStaff?.id ?? Date.now(),
      employeeId: String(values.employeeId ?? ""),
      name: String(values.name ?? ""),
      department: String(values.department ?? ""),
      designation: String(values.designation ?? ""),
      joiningDate: String(values.joiningDate ?? ""),
      phone: String(values.phone ?? ""),
      email: String(values.email ?? ""),
      address: String(values.address ?? ""),
      gender: String(values.gender ?? "Male"),
      nationalId: String(values.nationalId ?? ""),
      status: String(values.status ?? "Active"),
    };

    setStaffRecords((current) =>
      editingStaff ? current.map((staff) => (staff.id === editingStaff.id ? payload : staff)) : [payload, ...current],
    );
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">Add staff members and keep their personal information organized.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search staff"
              className="w-full sm:w-72 rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={openNewStaffDialog}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Add />
            Add Staff
          </button>
        </div>
      </div>

      <ActionDialog
        open={staffDialogOpen}
        onOpenChange={setStaffDialogOpen}
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
        description="Capture staff personal information and employment details."
        submitLabel={editingStaff ? "Update Staff" : "Save Staff"}
        initialValues={staffFormValues}
        fields={[
          { name: "employeeId", label: "Employee ID", placeholder: "HR-1001" },
          { name: "name", label: "Full Name", placeholder: "Enter full name" },
          { name: "department", label: "Department", placeholder: "Administration" },
          { name: "designation", label: "Designation", placeholder: "HR Officer" },
          { name: "joiningDate", label: "Joining Date", type: "date" },
          { name: "phone", label: "Phone", placeholder: "+1-555-0101" },
          { name: "email", label: "Email", type: "email", placeholder: "name@hrms.edu" },
          { name: "gender", label: "Gender", type: "select", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }] },
          { name: "nationalId", label: "National ID", placeholder: "NI-0000-0000" },
          { name: "address", label: "Address", type: "textarea", rows: 3, placeholder: "Enter current address" },
          { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "On Leave", value: "On Leave" }, { label: "Inactive", value: "Inactive" }] },
        ]}
        onSubmit={handleStaffSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staffRecords.length}</p>
            </div>
            <Groups className="text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{staffRecords.filter((staff) => staff.status === "Active").length}</p>
            </div>
            <Work className="text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{staffRecords.filter((staff) => staff.status === "On Leave").length}</p>
            </div>
            <Badge className="text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Staff Profiles</h3>
          <p className="text-sm text-gray-500">{filteredStaff.length} record(s)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Designation</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joining Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{staff.name}</td>
                  <td className="py-3 px-4 text-gray-700">{staff.employeeId}</td>
                  <td className="py-3 px-4 text-gray-700">{staff.department}</td>
                  <td className="py-3 px-4 text-gray-700">{staff.designation}</td>
                  <td className="py-3 px-4 text-gray-700">{staff.joiningDate}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="space-y-1">
                      <p>{staff.phone}</p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        staff.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : staff.status === "On Leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => viewStaffProfile(staff)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View staff"
                      >
                        <Visibility fontSize="small" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditStaffDialog(staff)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit staff"
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
    </div>
  );
}
