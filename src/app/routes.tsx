import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import TeacherProfile from "./components/TeacherProfile";
import TeacherDetails from "./components/TeacherDetails";
import Attendance from "./components/Attendance";
import Payroll from "./components/Payroll";
import AccountingFinance from "./components/AccountingFinance";
import NotFound from "./components/NotFound";
import LeaveManagement from "./components/LeaveManagement";
import ResignManagement from "./components/ExitManagement";
import StuffManagement from "./components/StuffManagement";
import Settings from "./components/Settings";
import SettingsSection from "./components/SettingsSection";
import RoleManagement from "./components/RoleManagement";
import VacancyManagement from "./components/VacancyManagement";
import TeacherPortal from "./components/TeacherPortal";
import AdminPanel from "./components/AdminPanel";
import AdmissionsManagement from "./components/AdmissionsManagement";
import { LibraryManagement, TransportManagement } from "./components/CollegeOperationsModules";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <NotFound />,
    children: [
      { index: true, Component: Dashboard },
      { path: "admissions", Component: AdmissionsManagement },
      { path: "library", Component: LibraryManagement },
      { path: "library/dashboard", Component: LibraryManagement },
      { path: "library/books", Component: LibraryManagement },
      { path: "library/racks", Component: LibraryManagement },
      { path: "library/borrow-return", Component: LibraryManagement },
      { path: "library/reservations", Component: LibraryManagement },
      { path: "library/fines", Component: LibraryManagement },
      { path: "library/reports", Component: LibraryManagement },
      { path: "transport", Component: TransportManagement },
      { path: "transport/dashboard", Component: TransportManagement },
      { path: "transport/routes", Component: TransportManagement },
      { path: "transport/vehicles", Component: TransportManagement },
      { path: "transport/drivers", Component: TransportManagement },
      { path: "transport/vendors", Component: TransportManagement },
      { path: "transport/contracts", Component: TransportManagement },
      { path: "transport/student-allocation", Component: TransportManagement },
      { path: "transport/maintenance", Component: TransportManagement },
      { path: "transport/reports", Component: TransportManagement },
      { path: "admin-panel", Component: AdminPanel },
      { path: "teachers", Component: TeacherProfile },
      { path: "teachers/:teacherId", Component: TeacherDetails },
      { path: "attendance", Component: Attendance },
      { path: "teacher-portal", Component: TeacherPortal },
      { path: "payroll", Component: Payroll },
      { path: "accounting", Component: AccountingFinance },
      { path: "leave", Component: LeaveManagement },
      { path: "staff", Component: StuffManagement },
      { path: "stuff", Component: StuffManagement },
      { path: "settings", Component: Settings },
      { path: "settings/roles", Component: RoleManagement },
      { path: "settings/vacancies", Component: VacancyManagement },
      { path: "settings/:sectionKey", Component: SettingsSection },
      { path: "resign", Component: ResignManagement }, // Updated route
      { path: "*", Component: NotFound },
    ],
  },
]);
