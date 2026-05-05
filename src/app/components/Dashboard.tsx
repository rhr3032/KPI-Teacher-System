import {
  People,
  AccessTime,
  EventNote,
  Assignment,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";

export default function Dashboard() {
  const stats = [
    { label: "Total Teachers", value: "247", change: "+12", trend: "up", icon: <People /> },
    { label: "Present Today", value: "234", change: "94.7%", trend: "up", icon: <AccessTime /> },
    { label: "Pending Leaves", value: "18", change: "-3", trend: "down", icon: <EventNote /> },
    { label: "Active Tasks", value: "42", change: "+5", trend: "up", icon: <Assignment /> },
  ];

  const recentActivities = [
    { type: "Leave", teacher: "John Smith", action: "Applied for sick leave", time: "2 hours ago" },
    { type: "Task", teacher: "Sarah Johnson", action: "Completed exam duty assignment", time: "3 hours ago" },
    { type: "Profile", teacher: "Michael Chen", action: "Profile updated", time: "5 hours ago" },
    { type: "Attendance", teacher: "Emma Williams", action: "Late check-in recorded", time: "6 hours ago" },
  ];

  const upcomingEvents = [
    { event: "ACR Review Deadline", date: "May 15, 2026", priority: "high" },
    { event: "Payroll Processing", date: "May 10, 2026", priority: "medium" },
    { event: "Staff Meeting", date: "May 8, 2026", priority: "low" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="text-green-600 text-sm" />
                  ) : (
                    <TrendingDown className="text-red-600 text-sm" />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="text-blue-600 text-4xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-semibold">
                    {activity.type}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.teacher}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{event.event}</p>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : event.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {event.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
