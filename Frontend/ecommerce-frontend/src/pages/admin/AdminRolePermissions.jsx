import React, { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import {
  getAdminPermissions,
  getAdminRoles,
  getAdminRoleUsers,
  updateAdminPermission,
  updateAdminUserRole,
} from "../../services/adminService";

// Helpers ----------------------------------------------------------------

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

// Pretty labels for the matrix — the DB stores stable `moduleKey`
// slugs while the UI shows a human-readable label and a short note.
const MODULE_DEFINITIONS = [
  {
    key: "dashboard",
    label: "Dashboard",
    help: "Role-specific overview cards",
  },
  {
    key: "manage_sellers",
    label: "Manage Sellers",
    help: "Create / deactivate sellers",
  },
  {
    key: "manage_customers",
    label: "Manage Customers",
    help: "Create / deactivate customers",
  },
  {
    key: "categories_products",
    label: "Categories & Products",
    help: "Admin: full. Sellers manage their own products.",
  },
  {
    key: "stocks_deals",
    label: "Stocks & Deals",
    help: "Sellers manage their own stock + pricing",
  },
  {
    key: "orders_shipping",
    label: "Orders & Shipping",
    help: "Customers see own orders; sellers see only orders for their products",
  },
  {
    key: "refunds",
    label: "Refunds",
    help: "Customers request; admins approve",
  },
  {
    key: "reviews",
    label: "Reviews",
    help: "Sellers can read their product reviews; customers author them",
  },
  {
    key: "messages",
    label: "Messages",
    help: "Direct customer ↔ seller chat",
  },
  {
    key: "role_permissions",
    label: "Role Permissions",
    help: "This page — admins only",
  },
];

// A checked box grants module access; an unchecked box denies it.
const CapabilityCell = ({ value, onChange, busy }) => {
  const checked = value !== "deny";
  return (
    <label className="form-check d-flex justify-content-center align-items-center mb-0">
      <input
        className="form-check-input mt-0"
        type="checkbox"
        checked={checked}
        disabled={busy}
        aria-label={`${checked ? "Allow" : "Deny"} module`}
        onChange={(event) => onChange(event.target.checked ? "allow" : "deny")}
      />
      <span className="ms-2 small">{checked ? "Allowed" : "Denied"}</span>
    </label>
  );
};

// Component --------------------------------------------------------------

const AdminRolePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [draftRoleId, setDraftRoleId] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);
  const [busyCell, setBusyCell] = useState(null); // `${roleId}:${moduleKey}`

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [roleList, userList, permissionList] = await Promise.all([
        getAdminRoles().catch(() => []),
        getAdminRoleUsers().catch(() => []),
        getAdminPermissions().catch(() => []),
      ]);

      setRoles(Array.isArray(roleList) ? roleList : []);
      setUsers(Array.isArray(userList) ? userList : []);
      setPermissions(Array.isArray(permissionList) ? permissionList : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load role permissions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const totalUsers = useMemo(
    () => roles.reduce((sum, role) => sum + (role.userCount || 0), 0),
    [roles],
  );

  // Build an O(1) lookup map: cellLookup[`${roleId}:${moduleKey}`] = capability
  const cellLookup = useMemo(() => {
    const map = new Map();
    permissions.forEach((perm) => {
      map.set(`${perm.roleId}:${perm.moduleKey}`, perm.capability);
    });
    return map;
  }, [permissions]);

  const getCapability = (roleId, moduleKey) =>
    cellLookup.get(`${roleId}:${moduleKey}`) || "deny";

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((entry) =>
      [entry.fullName, entry.email]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [users, search]);

  const handleCapabilityChange = async (
    roleId,
    moduleKey,
    capability,
  ) => {
    const cellKey = `${roleId}:${moduleKey}`;
    const previous = getCapability(roleId, moduleKey);

    if (previous === capability) {
      return;
    }

    // Optimistic update so the dropdown reflects the new value
    // immediately, then revert on error.
    setPermissions((current) => {
      const others = current.filter(
        (entry) =>
          !(
            entry.roleId === roleId && entry.moduleKey === moduleKey
          ),
      );
      return [
        ...others,
        {
          id: cellKey,
          roleId,
          roleName:
            roles.find((role) => role.id === roleId)?.name ?? "",
          moduleKey,
          capability,
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    try {
      setBusyCell(cellKey);

      await updateAdminPermission(roleId, moduleKey, capability);

      toast.success(
        `${moduleKey.replace(/_/g, " ")} → ${capability} for ${
          roles.find((role) => role.id === roleId)?.name ?? "role"
        }.`,
      );
    } catch (err) {
      // Roll back on failure.
      setPermissions((current) => {
        const others = current.filter(
          (entry) =>
            !(
              entry.roleId === roleId && entry.moduleKey === moduleKey
            ),
        );
        return [
          ...others,
          {
            id: cellKey,
            roleId,
            roleName:
              roles.find((role) => role.id === roleId)?.name ?? "",
            moduleKey,
            capability: previous,
            updatedAt: new Date().toISOString(),
          },
        ];
      });

      toast.error(
        err.response?.data?.message ||
          "Unable to update this cell.",
      );
    } finally {
      setBusyCell(null);
    }
  };

  const startEdit = (entry) => {
    setEditingUserId(entry.userId);
    setDraftRoleId("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setDraftRoleId("");
  };

  const saveEdit = async (entry) => {
    if (!draftRoleId) {
      toast.warning("Please pick a role first.");
      return;
    }

    try {
      setSavingUserId(entry.userId);

      await updateAdminUserRole(entry.userId, Number(draftRoleId));

      toast.success(`Role updated for ${entry.fullName}.`);

      setEditingUserId(null);
      setDraftRoleId("");
      await loadAll();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to update role.",
      );
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Role Permissions</h2>
          <p className="text-muted mb-0">
            Manage which role every user holds and adjust the permission
            matrix for each role on the platform. Check a box to allow module
            access or clear it to deny access.
          </p>
        </div>
        <span className="badge bg-primary-subtle text-primary fs-6 px-3 py-2">
          {roles.length} roles · {totalUsers} assignments
        </span>
      </div>

      {/* Roles overview */}
      <section className="mb-4">
        <h5 className="mb-3">Roles overview</h5>
        {loading ? (
          <div className="row g-3">
            {[1, 2, 3].map((idx) => (
              <div className="col-md-4" key={idx}>
                <div
                  className="skeleton"
                  style={{ height: 96, borderRadius: "var(--radius-md)" }}
                />
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="alert alert-info mb-0">
            No roles found. Seed the Roles table to start managing
            permissions.
          </div>
        ) : (
          <div className="row g-3">
            {roles.map((role) => (
              <div className="col-12 col-md-4" key={role.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{role.name}</h6>
                      <span className="badge bg-primary">
                        {role.userCount} user
                        {role.userCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="small text-muted mb-0">
                      {role.description ||
                        "Custom role with no description set yet."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editable permission matrix */}
      <section className="mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h5 className="mb-0">Permission matrix</h5>
          <small className="text-muted">
            Check to allow · Uncheck to deny
          </small>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 200 }}>Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center">
                      {role.name}
                    </th>
                  ))}
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_DEFINITIONS.map((mod) => (
                  <tr key={mod.key}>
                    <td className="fw-semibold">{mod.label}</td>
                    {roles.map((role) => {
                      const cellKey = `${role.id}:${mod.key}`;
                      const value = getCapability(role.id, mod.key);

                      return (
                        <td
                          key={cellKey}
                          style={{ minWidth: 160 }}
                          className="text-center"
                        >
                          <CapabilityCell
                            value={value}
                            busy={busyCell === cellKey}
                            onChange={(next) =>
                              handleCapabilityChange(
                                role.id,
                                mod.key,
                                next,
                              )
                            }
                          />
                        </td>
                      );
                    })}
                    <td className="small text-muted">{mod.help}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="small text-muted mt-2 mb-0">
          ℹ️ Built-in defaults reflect the access each role needs for this
          store. Changes here document intent and drive the UI badges. Backend
          authorization still uses the [Authorize(Roles = "...")]
          attributes — code-level role enforcement is intentional and not
          driven by this matrix.
        </p>
      </section>

      {/* User → role management */}
      <section>
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h5 className="mb-0">Manage user roles</h5>
          <div style={{ minWidth: 240 }}>
            <input
              type="search"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading users...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="alert alert-info mb-0">
            {users.length === 0
              ? "No users found in the role assignment table."
              : "No users match your search."}
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ minWidth: 280 }}>Change role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((entry) => {
                    const editing = editingUserId === entry.userId;

                    return (
                      <tr key={entry.userId}>
                        <td className="fw-semibold">
                          {entry.fullName}
                        </td>
                        <td>{entry.email}</td>
                        <td>
                          {entry.isActive ? (
                            <span className="badge bg-success">
                              Active
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td>{formatDate(entry.createdAt)}</td>
                        <td>
                          {editing ? (
                            <div className="d-flex gap-2 align-items-center flex-wrap">
                              <select
                                className="form-select form-select-sm"
                                style={{ maxWidth: 180 }}
                                value={draftRoleId}
                                onChange={(event) =>
                                  setDraftRoleId(event.target.value)
                                }
                                disabled={
                                  savingUserId === entry.userId
                                }
                              >
                                <option value="">Pick a role</option>
                                {roles.map((role) => (
                                  <option
                                    key={role.id}
                                    value={role.id}
                                  >
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => saveEdit(entry)}
                                disabled={
                                  savingUserId === entry.userId ||
                                  !draftRoleId
                                }
                              >
                                {savingUserId === entry.userId
                                  ? "Saving..."
                                  : "Save"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={cancelEdit}
                                disabled={
                                  savingUserId === entry.userId
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => startEdit(entry)}
                            >
                              Change role
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminRolePermissions;
