import { Link, useParams } from "react-router";
import {
  AccessTime,
  ArrowBack,
  CalendarMonth,
  CheckCircle,
  Download,
  Email,
  Payments,
  Person,
  Phone,
  Star,
  WorkHistory,
} from "@mui/icons-material";
import { createTeacherRecord, formatCurrency, formatDateLabel, getTeacherById } from "../teacher-data";

function getTeacherFallback(teacherId: number) {
  const teacher = getTeacherById(teacherId);

  if (!teacher) {
    return null;
  }

  return createTeacherRecord(teacher, teacher);
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: string }) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${tone}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{icon}</span>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">{value}%</span>
      </div>
      <svg viewBox="0 0 100 8" className="h-2 w-full overflow-hidden rounded-full" role="img" aria-label={`${label} ${value}%`}>
        <rect width="100" height="8" rx="4" fill="#e2e8f0" />
        <rect width={value} height="8" rx="4" fill="#2563eb" />
      </svg>
    </div>
  );
}

function SalaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function TeacherDetails() {
  const { teacherId } = useParams();
  const numericTeacherId = Number(teacherId);
  const teacher = Number.isFinite(numericTeacherId) ? getTeacherFallback(numericTeacherId) : null;

  if (!teacher) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Teacher not found</h2>
        <p className="mt-2 text-slate-600">The requested teacher record does not exist in the current session.</p>
        <Link
          to="/teachers"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ArrowBack fontSize="small" />
          Back to Teacher Profiles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-6 text-white shadow-lg md:flex-row md:items-end md:justify-between md:px-8">
        <div className="space-y-4">
          <Link to="/teachers" className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white">
            <ArrowBack fontSize="small" />
            Back to Teacher Profiles
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-3xl font-bold text-white ring-1 ring-white/15">
              {teacher.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Teacher Details</p>
              <h2 className="mt-1 text-3xl font-bold text-white">{teacher.name}</h2>
              <p className="mt-2 text-sm text-blue-100">
                {teacher.department} · {teacher.subject} · {teacher.type}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 text-sm text-blue-50 md:text-right">
          <div>Employee ID: {teacher.employeeId}</div>
          <div>Joining Date: {formatDateLabel(teacher.joiningDate)}</div>
          <div>Experience: {teacher.experience}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Performance Score"
          value={`${teacher.performance.overallScore}%`}
          helper="Latest annual confidential review"
          tone="border-blue-100"
        />
        <MetricCard
          label="Attendance Rate"
          value={`${teacher.attendance.attendanceRate}%`}
          helper={`${teacher.attendance.presentDays} present days in ${teacher.attendance.totalDays}`}
          tone="border-emerald-100"
        />
        <MetricCard
          label="Net Salary"
          value={formatCurrency(teacher.salary.netSalary)}
          helper={`Payroll for ${teacher.salary.month}`}
          tone="border-amber-100"
        />
        <MetricCard
          label="Overtime Money"
          value={formatCurrency(teacher.salary.overtimeMoney)}
          helper={`${teacher.salary.overtimeHours} overtime hours recorded`}
          tone="border-violet-100"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Personal Information" icon={<Person fontSize="small" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Date of Birth" value={formatDateLabel(teacher.dateOfBirth)} />
            <DetailItem label="Gender" value={teacher.gender} />
            <DetailItem label="Phone" value={teacher.phone} />
            <DetailItem label="Email" value={teacher.email} />
            <DetailItem label="Blood Group" value={teacher.bloodGroup} />
            <DetailItem label="Emergency Contact" value={teacher.emergencyContact} />
            <DetailItem label="Marital Status" value={teacher.maritalStatus} />
            <DetailItem label="National ID" value={teacher.nationalId} />
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Address</p>
            <p className="mt-2 leading-6">{teacher.address}</p>
          </div>
        </SectionCard>

        <SectionCard title="Employment Information" icon={<WorkHistory fontSize="small" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Department" value={teacher.department} />
            <DetailItem label="Subject" value={teacher.subject} />
            <DetailItem label="Teacher Type" value={teacher.type} />
            <DetailItem label="Joining Date" value={formatDateLabel(teacher.joiningDate)} />
            <DetailItem label="Experience" value={teacher.experience} />
            <DetailItem label="Institution" value={teacher.institutionName} />
            <DetailItem label="Qualification" value={teacher.academicQualification} />
            <DetailItem label="CGPA" value={teacher.cgpa} />
          </div>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">Summary</p>
            <p className="mt-2 leading-6">
              {teacher.name} is a {teacher.type.toLowerCase()} teacher assigned to the {teacher.department} department and
              currently teaches {teacher.subject}.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Attendance" icon={<AccessTime fontSize="small" />}>
          <div className="grid gap-3 sm:grid-cols-3">
            <DetailItem label="Present Days" value={`${teacher.attendance.presentDays}`} />
            <DetailItem label="Late Days" value={`${teacher.attendance.lateDays}`} />
            <DetailItem label="Absent Days" value={`${teacher.attendance.absentDays}`} />
          </div>
          <div className="mt-6 space-y-4">
            <ProgressRow label="Attendance Rate" value={teacher.attendance.attendanceRate} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <CheckCircle fontSize="small" />
                Monthly attendance notes
              </div>
              <p className="mt-2 leading-6">
                Attendance is tracked against a {teacher.attendance.totalDays}-day working month. Late arrivals are
                logged separately from approved absences.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Performance Score" icon={<Star fontSize="small" />}>
          <div className="space-y-4">
            <ProgressRow label="Overall Score" value={teacher.performance.overallScore} />
            <ProgressRow label="Teaching" value={teacher.performance.teaching} />
            <ProgressRow label="Punctuality" value={teacher.performance.punctuality} />
            <ProgressRow label="Engagement" value={teacher.performance.engagement} />
            <ProgressRow label="Professionalism" value={teacher.performance.professionalism} />
          </div>
        </SectionCard>

        <SectionCard title="Salary Statement" icon={<Payments fontSize="small" />}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <SalaryRow label="Month" value={teacher.salary.month} />
            <SalaryRow label="Base Salary" value={formatCurrency(teacher.salary.baseSalary)} />
            <SalaryRow label="Overtime Hours" value={`${teacher.salary.overtimeHours} hrs`} />
            <SalaryRow label="Overtime Money" value={formatCurrency(teacher.salary.overtimeMoney)} />
            <SalaryRow label="Allowance" value={formatCurrency(teacher.salary.allowance)} />
            <SalaryRow label="Deductions" value={`-${formatCurrency(teacher.salary.deductions)}`} />
            <SalaryRow label="Advance Deduction" value={`-${formatCurrency(teacher.salary.advanceDeduction)}`} />
            <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Net Salary</span>
                <span className="text-lg font-bold text-blue-700">{formatCurrency(teacher.salary.netSalary)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailItem label="Bank Name" value={teacher.salary.bankName} />
            <DetailItem label="Account Number" value={teacher.salary.accountNumber} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailItem label="Promoted Designation" value={teacher.promotedDesignation || "Not promoted yet"} />
            <DetailItem label="Promoted Salary" value={teacher.promotedSalary ? formatCurrency(teacher.promotedSalary) : "-"} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Overtime History" icon={<AccessTime fontSize="small" />}>
          <div className="space-y-3">
            {teacher.overtimeEntries.map((entry) => (
              <div key={`${entry.date}-${entry.reason}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.reason}</p>
                    <p className="text-sm text-slate-500">{formatDateLabel(entry.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{entry.hours} hours</p>
                    <p className="text-sm text-emerald-700">{formatCurrency(entry.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Documents and Notes" icon={<Download fontSize="small" />}>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Certificates</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {teacher.certificateNames.map((certificate) => (
                  <span key={certificate} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    {certificate}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Responsibilities</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {teacher.responsibilities.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Achievements</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {teacher.achievements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Notes</p>
              <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {teacher.notes.map((note) => (
                  <p key={note}>• {note}</p>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Quick Status</p>
            <p className="mt-2 text-lg font-semibold text-white">Everything needed for one teacher record is on this page.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <CalendarMonth fontSize="small" />
              Joined {formatDateLabel(teacher.joiningDate)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Email fontSize="small" />
              {teacher.email}
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone fontSize="small" />
              {teacher.phone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}