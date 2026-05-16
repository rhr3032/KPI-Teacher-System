export type LeaveRequest = {
  id: number;
  teacher: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  substitute: string | null;
  createdBy?: "admin" | "teacher";
};

const STORAGE_KEY = "kpi_teacher_leave_requests";

const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 1,
    teacher: "John Smith",
    department: "Mathematics",
    leaveType: "Sick Leave",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    days: 3,
    reason: "Medical treatment",
    status: "Pending",
    substitute: null,
    createdBy: "admin",
  },
  {
    id: 2,
    teacher: "Sarah Johnson",
    department: "Science",
    leaveType: "Annual Leave",
    startDate: "2026-05-15",
    endDate: "2026-05-20",
    days: 6,
    reason: "Personal vacation",
    status: "Approved",
    substitute: "Michael Chen",
    createdBy: "admin",
  },
  {
    id: 3,
    teacher: "Emma Williams",
    department: "History",
    leaveType: "Emergency Leave",
    startDate: "2026-05-06",
    endDate: "2026-05-06",
    days: 1,
    reason: "Family emergency",
    status: "Rejected",
    substitute: null,
    createdBy: "admin",
  },
  {
    id: 4,
    teacher: "Michael Chen",
    department: "English",
    leaveType: "Sick Leave",
    startDate: "2026-05-08",
    endDate: "2026-05-09",
    days: 2,
    reason: "Flu",
    status: "Approved",
    substitute: "John Smith",
    createdBy: "admin",
  },
];

export function loadLeaveRequests(): LeaveRequest[] {
  if (typeof window === "undefined") {
    return DEFAULT_LEAVE_REQUESTS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_LEAVE_REQUESTS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DEFAULT_LEAVE_REQUESTS;
    }

    return parsed as LeaveRequest[];
  } catch {
    return DEFAULT_LEAVE_REQUESTS;
  }
}

export function saveLeaveRequests(requests: LeaveRequest[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}
