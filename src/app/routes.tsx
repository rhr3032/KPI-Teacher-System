import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import TeacherProfile from "./components/TeacherProfile";
import Attendance from "./components/Attendance";
import Performance from "./components/Performance";
import Payroll from "./components/Payroll";
import LeaveManagement from "./components/LeaveManagement";
import TaskManagement from "./components/TaskManagement";
import Discipline from "./components/Discipline";
import ShiftManagement from "./components/ShiftManagement";
import ExitManagement from "./components/ExitManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "teachers", Component: TeacherProfile },
      { path: "attendance", Component: Attendance },
      { path: "performance", Component: Performance },
      { path: "payroll", Component: Payroll },
      { path: "leave", Component: LeaveManagement },
      { path: "tasks", Component: TaskManagement },
      { path: "discipline", Component: Discipline },
      { path: "shifts", Component: ShiftManagement },
      { path: "exit", Component: ExitManagement },
    ],
  },
]);
