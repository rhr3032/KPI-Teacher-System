import { Outlet, NavLink } from "react-router";
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings,
  School,
  People,
  AccessTime,
  Assessment,
  AttachMoney,
  EventNote,
  ExitToApp,
  Inventory2,
  LocalLibrary,
  DirectionsBus,
  Settings as SettingsIcon,
  Menu,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth";

export default function Layout() {
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminMenuItems = [
    { path: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/admissions", label: "Admissions & Registration", icon: <School /> },
    { path: "/library", label: "Library Management", icon: <LocalLibrary /> },
    { path: "/transport", label: "Transport Management", icon: <DirectionsBus /> },
    { path: "/admin-panel", label: "Students & Attendance", icon: <AdminPanelSettings /> },
    { path: "/teachers", label: "Teacher Profiles", icon: <People /> },
    { path: "/attendance", label: "Attendance", icon: <AccessTime /> },
    { path: "/payroll", label: "Payroll", icon: <AttachMoney /> },
    { path: "/accounting", label: "Accounting & Finance", icon: <Assessment /> },
    { path: "/leave", label: "Leave Management", icon: <EventNote /> },
    { path: "/staff", label: "Staff", icon: <Inventory2 /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
    { path: "/resign", label: "Resign Management", icon: <ExitToApp /> },
  ];

  const teacherMenuItems = [
    { path: "/teacher-portal", label: "Teacher Portal", icon: <EventNote /> },
  ];

  const menuItems = session.role === "admin" ? adminMenuItems : teacherMenuItems;
  const portalTitle = session.role === "admin" ? "Admin Portal" : "Teacher Portal";

  const headerDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    if (session.role === "teacher" && location.pathname !== "/teacher-portal") {
      navigate("/teacher-portal", { replace: true });
    }
  }, [session.role, location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-blue-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-800">
          {sidebarOpen && <h1 className="text-xl font-bold">KPI Teacher System</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            className="p-2 hover:bg-blue-800 rounded"
          >
            <Menu />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 hover:bg-blue-800 transition-colors ${
                  isActive ? "bg-blue-800 border-l-4 border-white" : ""
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="font-semibold">{session.name}</p>
              <p className="text-blue-300 text-xs">{session.email}</p>
              <button
                type="button"
                onClick={logout}
                className="mt-3 text-xs bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">KPI Teacher System - {portalTitle}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{headerDate}</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
