import { Add, DeleteOutline, Edit, ManageAccounts, RestartAlt, Save, Security } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  addRoleSystemConfigValue,
  removeRoleSystemConfigValue,
  updateRoleSystemConfigValue,
  useSystemConfig,
  type RoleOption,
} from "../system-config";
import { settingsSections } from "../settings-meta";

export default function RoleManagement() {
  const navigate = useNavigate();
  const { config, resetConfig } = useSystemConfig();
  const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [featureDraft, setFeatureDraft] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const totalFeatures = useMemo(
    () => config.roles.reduce((sum, role) => sum + role.features.length, 0),
    [config.roles],
  );

  const clearForm = () => {
    setEditingRoleName(null);
    setRoleName("");
    setRoleDescription("");
    setFeatureDraft("");
    setFeatures([]);
  };

  const openRoleForEdit = (role: RoleOption) => {
    setEditingRoleName(role.name);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setFeatureDraft("");
    setFeatures(role.features);
  };

  const addFeature = () => {
    const trimmedFeature = featureDraft.trim();

    if (!trimmedFeature) {
      return;
    }

    setFeatures((current) => (current.includes(trimmedFeature) ? current : [...current, trimmedFeature]));
    setFeatureDraft("");
  };

  const removeFeature = (feature: string) => {
    setFeatures((current) => current.filter((item) => item !== feature));
  };

  const saveRole = () => {
    const payload: RoleOption = {
      name: roleName,
      description: roleDescription,
      features,
    };

    if (editingRoleName) {
      updateRoleSystemConfigValue(editingRoleName, payload);
    } else {
      addRoleSystemConfigValue(payload);
    }

    clearForm();
  };

  const deleteRole = (role: RoleOption) => {
    removeRoleSystemConfigValue(role.name);
    if (editingRoleName === role.name) {
      clearForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <ManageAccounts />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
              <p className="text-gray-600 mt-1">Create custom roles and assign the features each role can access.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={resetConfig}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RestartAlt fontSize="small" />
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Roles</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{config.roles.length}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Features</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalFeatures}</p>
        </div>
        <div className="rounded-lg bg-white shadow p-5">
          <p className="text-sm text-gray-600">Available Apps</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{settingsSections.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{editingRoleName ? "Edit Role" : "Create Role"}</h3>
              <p className="text-sm text-gray-600 mt-1">Build a role with the features it should be able to use.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <Security fontSize="small" />
              Manual
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
                <span>Role Name</span>
                <input
                  type="text"
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder="e.g. Payroll Admin"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
                <span>Description</span>
                <textarea
                  value={roleDescription}
                  onChange={(event) => setRoleDescription(event.target.value)}
                  placeholder="Describe this role"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Custom Features</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={featureDraft}
                  onChange={(event) => setFeatureDraft(event.target.value)}
                  placeholder="Add a feature"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Add />
                  Add Feature
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.length > 0 ? (
                  features.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      title="Remove feature"
                    >
                      {feature}
                      <DeleteOutline fontSize="small" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No features added yet.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveRole}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Save fontSize="small" />
                {editingRoleName ? "Update Role" : "Create Role"}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Saved Roles</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your created roles and their feature access.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <ManageAccounts fontSize="small" />
              {config.roles.length}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {config.roles.map((role) => (
              <div key={role.name} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{role.description || "No description added."}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openRoleForEdit(role)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Edit fontSize="small" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRole(role)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      <DeleteOutline fontSize="small" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {role.features.length > 0 ? (
                    role.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No features assigned.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
