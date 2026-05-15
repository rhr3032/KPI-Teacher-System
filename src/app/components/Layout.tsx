import { Outlet, NavLink } from "react-router";
import {
  Dashboard as DashboardIcon,
  People,
  AccessTime,
  Assessment,
  AttachMoney,
  EventNote,
  ExitToApp,
  Inventory2,
  Settings as SettingsIcon,
  Menu,
} from "@mui/icons-material";
import { useState } from "react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/teachers", label: "Teacher Profiles", icon: <People /> },
    { path: "/attendance", label: "Attendance", icon: <AccessTime /> },
    { path: "/payroll", label: "Payroll", icon: <AttachMoney /> },
    { path: "/accounting", label: "Accounting & Finance", icon: <Assessment /> },
    { path: "/leave", label: "Leave Management", icon: <EventNote /> },
    { path: "/staff", label: "Staff", icon: <Inventory2 /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
    { path: "/exit", label: "Exit Management", icon: <ExitToApp /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-blue-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-800">
          {sidebarOpen && <h1 className="text-xl font-bold">HR Management System</h1>}
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
              <p className="font-semibold">Admin User</p>
              <p className="text-blue-300 text-xs">admin@kpi.edu</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Teacher Management System</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">May 5, 2026</span>
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
