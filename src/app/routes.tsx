import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import TeacherProfile from "./components/TeacherProfile";
import TeacherDetails from "./components/TeacherDetails";
import Attendance from "./components/Attendance";
import Payroll from "./components/Payroll";
import LeaveManagement from "./components/LeaveManagement";
import ExitManagement from "./components/ExitManagement";
import StuffManagement from "./components/StuffManagement";
import Settings from "./components/Settings";
import SettingsSection from "./components/SettingsSection";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "teachers", Component: TeacherProfile },
      { path: "teachers/:teacherId", Component: TeacherDetails },
      { path: "attendance", Component: Attendance },
      { path: "payroll", Component: Payroll },
      { path: "leave", Component: LeaveManagement },
      { path: "staff", Component: StuffManagement },
      { path: "stuff", Component: StuffManagement },
      { path: "settings", Component: Settings },
      { path: "settings/:sectionKey", Component: SettingsSection },
      { path: "exit", Component: ExitManagement },
    ],
  },
]);
