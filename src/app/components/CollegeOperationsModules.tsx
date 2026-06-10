import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Add,
  AssignmentReturn,
  BarChart,
  Build,
  Business,
  CheckCircle,
  Close,
  Description,
  DirectionsBus,
  Download,
  EventSeat,
  FilterAlt,
  Inventory2,
  LocalLibrary,
  Map,
  MenuBook,
  Paid,
  People,
  Person,
  Print,
  QrCode2,
  Route,
  Search,
  Visibility,
  Warning,
} from "@mui/icons-material";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ModuleKey = "library" | "transport";

type StatItem = {
  label: string;
  value: string;
  tone: string;
  icon: JSX.Element;
};

type TableRecord = Record<string, string | number>;

type DrawerMode = {
  title: string;
  description: string;
  fields: string[];
};

const libraryRoutes = [
  { path: "/library/dashboard", label: "Dashboard" },
  { path: "/library/books", label: "Books" },
  { path: "/library/racks", label: "Racks" },
  { path: "/library/borrow-return", label: "Borrow & Return" },
  { path: "/library/reservations", label: "Reservations" },
  { path: "/library/fines", label: "Fines" },
  { path: "/library/reports", label: "Reports" },
];

const transportRoutes = [
  { path: "/transport/dashboard", label: "Dashboard" },
  { path: "/transport/routes", label: "Routes" },
  { path: "/transport/vehicles", label: "Vehicles" },
  { path: "/transport/drivers", label: "Drivers" },
  { path: "/transport/vendors", label: "Vendors" },
  { path: "/transport/contracts", label: "Contracts" },
  { path: "/transport/student-allocation", label: "Student Allocation" },
  { path: "/transport/maintenance", label: "Maintenance" },
  { path: "/transport/reports", label: "Reports" },
];

const libraryStats: StatItem[] = [
  { label: "Total Books", value: "18,420", tone: "bg-sky-50 text-sky-700", icon: <MenuBook /> },
  { label: "Total Copies", value: "42,860", tone: "bg-cyan-50 text-cyan-700", icon: <Inventory2 /> },
  { label: "Available Books", value: "31,244", tone: "bg-emerald-50 text-emerald-700", icon: <CheckCircle /> },
  { label: "Issued Books", value: "9,216", tone: "bg-violet-50 text-violet-700", icon: <AssignmentReturn /> },
  { label: "Overdue Books", value: "284", tone: "bg-rose-50 text-rose-700", icon: <Warning /> },
  { label: "Active Members", value: "12,904", tone: "bg-amber-50 text-amber-700", icon: <People /> },
  { label: "Collected Fines", value: "৳148K", tone: "bg-teal-50 text-teal-700", icon: <Paid /> },
];

const transportStats: StatItem[] = [
  { label: "Total Vehicles", value: "126", tone: "bg-sky-50 text-sky-700", icon: <DirectionsBus /> },
  { label: "Own Vehicles", value: "74", tone: "bg-cyan-50 text-cyan-700", icon: <Inventory2 /> },
  { label: "Vendor Vehicles", value: "52", tone: "bg-violet-50 text-violet-700", icon: <Business /> },
  { label: "Active Routes", value: "38", tone: "bg-emerald-50 text-emerald-700", icon: <Route /> },
  { label: "Drivers", value: "143", tone: "bg-amber-50 text-amber-700", icon: <Person /> },
  { label: "Assigned Students", value: "7,824", tone: "bg-teal-50 text-teal-700", icon: <EventSeat /> },
  { label: "Maintenance Requests", value: "19", tone: "bg-rose-50 text-rose-700", icon: <Build /> },
];

const monthlyBorrowTrend = [
  { name: "Jan", borrowed: 1200, returned: 1090 },
  { name: "Feb", borrowed: 1420, returned: 1310 },
  { name: "Mar", borrowed: 1680, returned: 1500 },
  { name: "Apr", borrowed: 1810, returned: 1720 },
  { name: "May", borrowed: 1960, returned: 1840 },
  { name: "Jun", borrowed: 1740, returned: 1690 },
];

const vehicleUtilization = [
  { name: "Jan", utilization: 71, fuel: 340, vendor: 520 },
  { name: "Feb", utilization: 76, fuel: 360, vendor: 545 },
  { name: "Mar", utilization: 82, fuel: 410, vendor: 590 },
  { name: "Apr", utilization: 79, fuel: 388, vendor: 572 },
  { name: "May", utilization: 86, fuel: 426, vendor: 614 },
  { name: "Jun", utilization: 88, fuel: 444, vendor: 632 },
];

const libraryPie = [
  { name: "Science", value: 34 },
  { name: "Business", value: 22 },
  { name: "Humanities", value: 18 },
  { name: "Reference", value: 14 },
  { name: "Fiction", value: 12 },
];

const transportPie = [
  { name: "North Route", value: 86 },
  { name: "South Route", value: 74 },
  { name: "East Route", value: 68 },
  { name: "West Route", value: 59 },
  { name: "Campus Loop", value: 42 },
];

const libraryBooks: TableRecord[] = [
  { title: "Database Systems", accession: "BK-2026-00001", isbn: "978-0-3211-902", location: "Main / 2F / CS / R12 / S4 / P08", status: "Available", holder: "-" },
  { title: "Organic Chemistry", accession: "BK-2026-00042", isbn: "978-1-1180-312", location: "Science / 1F / CH / R03 / S2 / P11", status: "Issued", holder: "STU-09-1432" },
  { title: "Principles of Accounting", accession: "BK-2026-00118", isbn: "978-0-0735-221", location: "Business / 3F / AC / R09 / S1 / P02", status: "Overdue", holder: "STU-11-0821" },
  { title: "Bangladesh History", accession: "BK-2026-00204", isbn: "978-984-912", location: "Main / 1F / HS / R02 / S5 / P14", status: "Reserved", holder: "Queue 7" },
];

const racks: TableRecord[] = [
  { building: "Main Library", floor: "2nd Floor", section: "Computer Science", rack: "R12", shelf: "S4", capacity: 360, occupancy: "82%" },
  { building: "Science Wing", floor: "1st Floor", section: "Chemistry", rack: "R03", shelf: "S2", capacity: 240, occupancy: "71%" },
  { building: "Business Wing", floor: "3rd Floor", section: "Accounting", rack: "R09", shelf: "S1", capacity: 300, occupancy: "64%" },
];

const borrowRows: TableRecord[] = [
  { flow: "Issue", student: "Nusrat Jahan", qr: "BK-2026-00042", dueDate: "2026-06-24", fine: "৳0", status: "Issued" },
  { flow: "Return", student: "Rafi Ahmed", qr: "BK-2026-00118", dueDate: "2026-06-04", fine: "৳180", status: "Fine due" },
  { flow: "Renew", student: "Sadia Khan", qr: "BK-2026-00077", dueDate: "2026-07-01", fine: "৳0", status: "Renewed" },
];

const transportRows: TableRecord[] = [
  { route: "North Campus Express", vehicle: "DHK-11-2345", type: "Own Bus", driver: "Mahmud Hasan", capacity: 52, occupancy: "91%" },
  { route: "Mirpur Vendor Line", vehicle: "DHK-13-6721", type: "Vendor Coaster", driver: "Arif Hossain", capacity: 32, occupancy: "84%" },
  { route: "Uttara Morning", vehicle: "DHK-15-8910", type: "Own Bus", driver: "Sabbir Rahman", capacity: 48, occupancy: "76%" },
  { route: "Campus Loop", vehicle: "DHK-12-1134", type: "Own Microbus", driver: "Nayeem Islam", capacity: 18, occupancy: "61%" },
];

const driverRows: TableRecord[] = [
  { name: "Mahmud Hasan", phone: "+8801711000001", license: "DL-284911", expiry: "2027-01-18", assigned: "North Campus Express", status: "Active" },
  { name: "Arif Hossain", phone: "+8801711000002", license: "DL-302118", expiry: "2026-09-03", assigned: "Mirpur Vendor Line", status: "Active" },
  { name: "Sabbir Rahman", phone: "+8801711000003", license: "DL-118274", expiry: "2026-07-12", assigned: "Uttara Morning", status: "Renewal due" },
];

const vendorRows: TableRecord[] = [
  { vendor: "Metro Mobility Ltd.", contact: "Farhana Rahman", phone: "+8801811000001", vehicles: 22, monthlyRent: "৳1.8M", contract: "Active" },
  { vendor: "CityLink Transport", contact: "Tanvir Karim", phone: "+8801811000002", vehicles: 18, monthlyRent: "৳1.2M", contract: "Pending renewal" },
  { vendor: "SafeRide Services", contact: "Mohiuddin Ali", phone: "+8801811000003", vehicles: 12, monthlyRent: "৳860K", contract: "Active" },
];

const contractRows: TableRecord[] = [
  { vendor: "Metro Mobility Ltd.", start: "2026-01-01", end: "2026-12-31", monthlyRent: "৳1.8M", deposit: "৳500K", renewal: "2026-11-30", status: "Active" },
  { vendor: "CityLink Transport", start: "2025-07-01", end: "2026-06-30", monthlyRent: "৳1.2M", deposit: "৳350K", renewal: "2026-06-15", status: "Pending" },
  { vendor: "SafeRide Services", start: "2026-02-01", end: "2027-01-31", monthlyRent: "৳860K", deposit: "৳250K", renewal: "2026-12-31", status: "Active" },
];

const permissionMatrix = [
  { role: "Admin", library: "Full access", transport: "Full access", finance: "Fine and vendor approvals" },
  { role: "Librarian", library: "Books, racks, issue-return, reservations", transport: "No access", finance: "Fine collection" },
  { role: "Transport Manager", library: "No access", transport: "Routes, vehicles, drivers, allocation", finance: "Vendor bills read-only" },
  { role: "Accountant", library: "Fine reports", transport: "Contracts and expenses", finance: "Collections and payments" },
  { role: "Teacher", library: "Search, reserve, borrow history", transport: "Route lookup", finance: "No access" },
  { role: "Student", library: "Search, reserve, own history", transport: "Assigned route and seat", finance: "Own fines and fees" },
];

const apiLibrary = [
  "GET /api/library/dashboard",
  "GET|POST /api/library/books",
  "POST /api/library/books/:bookId/copies",
  "POST /api/library/copies/:copyId/qr",
  "GET|POST /api/library/racks",
  "POST /api/library/borrowings/issue",
  "POST /api/library/borrowings/return",
  "GET|POST /api/library/reservations",
  "GET|POST /api/library/fines",
  "GET /api/library/reports/:reportKey",
];

const apiTransport = [
  "GET /api/transport/dashboard",
  "GET|POST /api/transport/routes",
  "POST /api/transport/routes/:routeId/stops",
  "GET|POST /api/transport/vehicles",
  "GET|POST /api/transport/drivers",
  "POST /api/transport/assignments",
  "GET|POST /api/transport/vendors",
  "GET|POST /api/transport/contracts",
  "GET|POST /api/transport/student-allocations",
  "GET|POST /api/transport/maintenance",
  "GET /api/transport/reports/:reportKey",
];

const schemaLibrary = [
  "libraries(id, name, campus_id)",
  "library_buildings(id, library_id, name)",
  "library_floors(id, building_id, floor_no)",
  "library_sections(id, floor_id, name)",
  "library_racks(id, section_id, code, capacity)",
  "library_shelves(id, rack_id, code, capacity)",
  "book_titles(id, title, isbn, author, publisher, edition, language, category, pages, purchase_date, price)",
  "book_copies(id, book_title_id, accession_no, qr_code, building_id, floor_id, section_id, rack_id, shelf_id, position, status)",
  "library_borrowings(id, copy_id, member_id, issue_date, due_date, return_date, fine_amount, status)",
  "library_reservations(id, book_title_id, member_id, queue_no, status)",
  "library_fine_transactions(id, borrowing_id, amount, adjustment, collected_by, collected_at)",
];

const schemaTransport = [
  "transport_routes(id, name, start_location, destination, distance_km, travel_time, capacity)",
  "transport_stops(id, route_id, stop_name, sequence_no, pickup_time)",
  "transport_vehicles(id, owner_type, vendor_id, vehicle_no, type, brand, model, year, capacity, fuel_type, registration_no, insurance_expiry, fitness_expiry, status)",
  "transport_drivers(id, name, phone, email, license_no, license_expiry, address, emergency_contact)",
  "transport_assignments(id, vehicle_id, driver_id, route_id, shift, start_date, end_date, status)",
  "transport_vendors(id, vendor_name, company_name, contact_person, phone, email, address, trade_license, tin)",
  "transport_contracts(id, vendor_id, start_date, end_date, monthly_rent, security_deposit, renewal_date, status)",
  "student_transport_allocations(id, student_id, route_id, pickup_stop_id, vehicle_id, seat_no, status)",
  "transport_maintenance(id, vehicle_id, request_type, cost, status, requested_at, completed_at)",
];

const colors = ["#0ea5e9", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444"];

function getRouteKey(pathname: string, moduleKey: ModuleKey) {
  const routeKey = pathname.split("/")[2];
  if (!routeKey) {
    return "dashboard";
  }
  return routeKey;
}

function statusClass(value: string | number) {
  const text = String(value).toLowerCase();
  if (text.includes("available") || text.includes("active") || text.includes("issued") || text.includes("renewed")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (text.includes("overdue") || text.includes("fine") || text.includes("expired") || text.includes("renewal")) {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  if (text.includes("reserved") || text.includes("pending")) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function ModuleShell({ moduleKey }: { moduleKey: ModuleKey }) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [drawer, setDrawer] = useState<DrawerMode | null>(null);
  const routeKey = getRouteKey(location.pathname, moduleKey);
  const isLibrary = moduleKey === "library";
  const routes = isLibrary ? libraryRoutes : transportRoutes;
  const stats = isLibrary ? libraryStats : transportStats;
  const title = isLibrary ? "Library Management" : "Transport Management";
  const subtitle = isLibrary
    ? "Rack-wise collection control, accession QR codes, issue-return, reservations, fines, and reports."
    : "Own and vendor fleet operations, route occupancy, driver assignment, contracts, maintenance, and student allocation.";
  const primaryRows = isLibrary ? libraryBooks : transportRows;
  const secondaryRows = isLibrary ? racks : driverRows;
  const tertiaryRows = isLibrary ? borrowRows : vendorRows;
  const activeApi = isLibrary ? apiLibrary : apiTransport;
  const activeSchema = isLibrary ? schemaLibrary : schemaTransport;
  const chartData = isLibrary ? monthlyBorrowTrend : vehicleUtilization;
  const pieData = isLibrary ? libraryPie : transportPie;

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return primaryRows.filter((row) => {
      const matchesQuery = !normalized || Object.values(row).some((value) => String(value).toLowerCase().includes(normalized));
      const matchesFilter = filter === "All" || Object.values(row).some((value) => String(value).includes(filter));
      return matchesQuery && matchesFilter;
    });
  }, [filter, primaryRows, query]);

  const drawerFields = isLibrary
    ? ["Title", "ISBN", "Author", "Publisher", "Edition", "Language", "Category", "Pages", "Purchase Date", "Price", "Building", "Floor", "Section", "Rack", "Shelf", "Position"]
    : ["Vehicle Number", "Vehicle Type", "Brand", "Model", "Year", "Capacity", "Fuel Type", "Registration Number", "Insurance Expiry", "Fitness Expiry", "Driver", "Route", "Shift"];

  const openCreateDrawer = () => {
    setDrawer({
      title: isLibrary ? "Create book title and copies" : "Create vehicle assignment",
      description: isLibrary
        ? "Add bibliographic details, rack location, accession numbers, and QR-ready copy data."
        : "Link vehicle, driver, route, shift, compliance dates, and assignment history.",
      fields: drawerFields,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-3 ${isLibrary ? "bg-sky-50 text-sky-700" : "bg-teal-50 text-teal-700"}`}>
              {isLibrary ? <LocalLibrary /> : <DirectionsBus />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="mt-1 max-w-4xl text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Add fontSize="small" /> New
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              <Download fontSize="small" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border-b border-slate-200 px-3">
          <nav className="flex min-w-max gap-1">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `border-b-2 px-3 py-3 text-sm font-semibold ${
                    isActive || (location.pathname === `/${moduleKey}` && route.path.endsWith("/dashboard"))
                      ? "border-sky-600 text-sky-700"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {route.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.slice(0, 4).map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.tone}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </section>

      {routeKey === "dashboard" ? (
        <DashboardPanels isLibrary={isLibrary} stats={stats} chartData={chartData} pieData={pieData} />
      ) : null}

      {["books", "vehicles", "routes"].includes(routeKey) || location.pathname === `/${moduleKey}` ? (
        <DataWorkspace
          title={isLibrary ? "Books and copy registry" : routeKey === "routes" ? "Route and occupancy plan" : "Vehicle registry"}
          description={isLibrary ? "Every copy has a unique accession number, QR code, availability status, and rack location." : "Track own and vendor vehicles, capacity, compliance dates, route assignment, and utilization."}
          rows={filteredRows}
          query={query}
          setQuery={setQuery}
          filter={filter}
          setFilter={setFilter}
          filters={isLibrary ? ["All", "Available", "Issued", "Overdue", "Reserved"] : ["All", "Own Bus", "Vendor Coaster", "Own Microbus"]}
          onCreate={openCreateDrawer}
        />
      ) : null}

      {routeKey === "racks" || routeKey === "drivers" ? (
        <DataWorkspace
          title={isLibrary ? "Rack-wise book management" : "Driver management"}
          description={isLibrary ? "Create buildings, floors, sections, racks, shelves, and monitor capacity against occupancy." : "Manage license expiry, assignment, reassignment, emergency contacts, and driver history."}
          rows={secondaryRows}
          query={query}
          setQuery={setQuery}
          filter={filter}
          setFilter={setFilter}
          filters={["All", "Active", "Renewal due"]}
          onCreate={openCreateDrawer}
        />
      ) : null}

      {routeKey === "borrow-return" || routeKey === "vendors" ? (
        <DataWorkspace
          title={isLibrary ? "Borrow and return desk" : "Vendor management"}
          description={isLibrary ? "Issue flow: search student, scan book QR, set due date, then issue. Return flow calculates fine automatically." : "Maintain vendor profiles, trade license, TIN, vehicles, drivers, routes, rent, and contract status."}
          rows={tertiaryRows}
          query={query}
          setQuery={setQuery}
          filter={filter}
          setFilter={setFilter}
          filters={["All", "Issued", "Fine due", "Active", "Pending renewal"]}
          onCreate={openCreateDrawer}
        />
      ) : null}

      {routeKey === "contracts" ? (
        <DataWorkspace
          title="Contract management"
          description="Track contract start, end, monthly rent, security deposit, renewal date, status, and reminders."
          rows={contractRows}
          query={query}
          setQuery={setQuery}
          filter={filter}
          setFilter={setFilter}
          filters={["All", "Active", "Pending", "Expired"]}
          onCreate={openCreateDrawer}
        />
      ) : null}

      {routeKey === "reservations" || routeKey === "fines" || routeKey === "student-allocation" || routeKey === "maintenance" ? (
        <WorkflowPanels isLibrary={isLibrary} routeKey={routeKey} onCreate={openCreateDrawer} />
      ) : null}

      {routeKey === "reports" ? (
        <ArchitecturePanels isLibrary={isLibrary} apiItems={activeApi} schemaItems={activeSchema} />
      ) : null}

      <ArchitecturePanels isLibrary={isLibrary} apiItems={activeApi} schemaItems={activeSchema} compact />

      {drawer ? <SlideOver drawer={drawer} onClose={() => setDrawer(null)} isLibrary={isLibrary} /> : null}
    </div>
  );
}

function DashboardPanels({
  isLibrary,
  stats,
  chartData,
  pieData,
}: {
  isLibrary: boolean;
  stats: StatItem[];
  chartData: Record<string, string | number>[];
  pieData: { name: string; value: number }[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200 xl:col-span-2">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{isLibrary ? "Monthly borrow trend" : "Vehicle utilization and cost trend"}</h2>
          <p className="text-sm text-slate-600">
            {isLibrary ? "Borrowed and returned copies across the current academic session." : "Utilization percentage with fuel and vendor expense movement."}
          </p>
        </div>
        <div className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            {isLibrary ? (
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="borrowed" fill="#0ea5e9" radius={[5, 5, 0, 0]} />
                <Bar dataKey="returned" fill="#14b8a6" radius={[5, 5, 0, 0]} />
              </RechartsBarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="utilization" stroke="#0ea5e9" strokeWidth={3} />
                <Line type="monotone" dataKey="fuel" stroke="#f59e0b" strokeWidth={3} />
                <Line type="monotone" dataKey="vendor" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{isLibrary ? "Category distribution" : "Route occupancy"}</h2>
          <p className="text-sm text-slate-600">{isLibrary ? "Collection spread by category." : "Seat occupancy by active routes."}</p>
        </div>
        <div className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={102} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:col-span-3">
        {stats.slice(4).map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.tone}`}>{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function DataWorkspace({
  title,
  description,
  rows,
  query,
  setQuery,
  filter,
  setFilter,
  filters,
  onCreate,
}: {
  title: string;
  description: string;
  rows: TableRecord[];
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  filters: string[];
  onCreate: () => void;
}) {
  const columns = Object.keys(rows[0] ?? {});

  return (
    <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
            <Search fontSize="small" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-56 outline-none" placeholder="Search table" />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
            <FilterAlt fontSize="small" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="bg-white outline-none">
              {filters.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={onCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white">
            <Add fontSize="small" /> Add
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">
                <input type="checkbox" aria-label="Select all rows" className="h-4 w-4 rounded border-slate-300" />
              </th>
              {columns.map((column) => (
                <th key={column} className="px-5 py-3 font-medium capitalize">{column.replace(/([A-Z])/g, " $1")}</th>
              ))}
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <input type="checkbox" aria-label={`Select row ${index + 1}`} className="h-4 w-4 rounded border-slate-300" />
                </td>
                {columns.map((column) => {
                  const value = row[column];
                  const isStatus = column.toLowerCase().includes("status") || column.toLowerCase().includes("contract");
                  return (
                    <td key={column} className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {isStatus ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(value)}`}>{value}</span>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button type="button" title="View details" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100">
                      <Visibility fontSize="small" />
                    </button>
                    <button type="button" title="Print QR or manifest" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100">
                      <Print fontSize="small" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-5 py-10 text-center text-slate-500">
                  No records match the current search or filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {rows.length} records, sorted by latest activity</span>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5">Previous</button>
          <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-white">1</span>
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5">2</button>
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5">Next</button>
        </div>
      </div>
    </section>
  );
}

function WorkflowPanels({ isLibrary, routeKey, onCreate }: { isLibrary: boolean; routeKey: string; onCreate: () => void }) {
  const isFine = routeKey === "fines";
  const isAllocation = routeKey === "student-allocation";
  const isMaintenance = routeKey === "maintenance";
  const title = isFine
    ? "Fine management"
    : isAllocation
      ? "Student transport allocation"
      : isMaintenance
        ? "Maintenance requests"
        : isLibrary
          ? "Reservations and waiting list"
          : "Student transport allocation";
  const steps = isAllocation
    ? ["Student", "Route", "Pickup Point", "Vehicle", "Seat Assignment"]
    : isMaintenance
      ? ["Vehicle", "Issue Type", "Workshop", "Cost Approval", "Complete"]
      : isFine
        ? ["Daily Rate", "Manual Adjustment", "Collection", "Receipt", "Report"]
        : ["Unavailable Book", "Reserve", "Queue Position", "Notify", "Issue"];

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">Operational workflow with states, approvals, notifications, and audit history.</p>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          <Add fontSize="small" /> Create request
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">{index + 1}</div>
            <h3 className="mt-3 font-semibold text-slate-900">{step}</h3>
            <p className="mt-2 text-sm text-slate-600">Status, owner, timestamp, and notification are stored for this stage.</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Loading state</h3>
          <div className="mt-3 h-3 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 p-4">
          <h3 className="font-semibold text-slate-900">Empty state</h3>
          <p className="mt-2 text-sm text-slate-600">A guided action appears when no reservations, fines, allocations, or maintenance items exist.</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="font-semibold text-emerald-900">Success state</h3>
          <p className="mt-2 text-sm text-emerald-700">Submission confirms the new request and updates dashboard metrics immediately.</p>
        </div>
      </div>
    </section>
  );
}

function ArchitecturePanels({
  isLibrary,
  apiItems,
  schemaItems,
  compact = false,
}: {
  isLibrary: boolean;
  apiItems: string[];
  schemaItems: string[];
  compact?: boolean;
}) {
  const componentItems = isLibrary
    ? ["LibraryDashboard", "BookCopyTable", "RackTree", "QrPreviewPanel", "BorrowReturnDrawer", "ReservationQueue", "FineCollectionPanel", "LibraryReportBuilder"]
    : ["TransportDashboard", "RoutePlanner", "VehicleTable", "DriverAssignmentDrawer", "VendorContractPanel", "SeatAllocationGrid", "MaintenanceBoard", "TransportReportBuilder"];

  if (compact) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <Description className="text-sky-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Implementation blueprint</h2>
            <p className="text-sm text-slate-600">
              IA, routes, schema, flows, responsive screens, permission matrix, API shape, and component architecture are represented in this module workspace.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Database schema</h2>
          <p className="text-sm text-slate-600">Core tables and relationships for production implementation.</p>
        </div>
        <div className="space-y-2 p-5">
          {schemaItems.map((item) => (
            <code key={item} className="block rounded-lg bg-slate-950 px-3 py-2 text-xs text-slate-100">{item}</code>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">API structure</h2>
          <p className="text-sm text-slate-600">REST endpoints aligned with dashboard, CRUD, scan, assignment, and reporting flows.</p>
        </div>
        <div className="space-y-2 p-5">
          {apiItems.map((item) => (
            <code key={item} className="block rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">{item}</code>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Permission matrix</h2>
          <p className="text-sm text-slate-600">Role-based access for Admin, Librarian, Transport Manager, Accountant, Teacher, and Student.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                {["Role", "Library", "Transport", "Finance"].map((header) => (
                  <th key={header} className="px-5 py-3 font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionMatrix.map((row) => (
                <tr key={row.role}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{row.role}</td>
                  <td className="px-5 py-3 text-slate-700">{row.library}</td>
                  <td className="px-5 py-3 text-slate-700">{row.transport}</td>
                  <td className="px-5 py-3 text-slate-700">{row.finance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Component architecture</h2>
          <p className="text-sm text-slate-600">Reusable pieces for high-fidelity dashboard, table, drawer, mobile, and detail-panel layouts.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {componentItems.map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <BarChart fontSize="small" className="text-sky-600" />
                <span className="font-semibold text-slate-900">{item}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Responsive desktop, tablet, and mobile-ready UI block.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SlideOver({ drawer, onClose, isLibrary }: { drawer: DrawerMode; onClose: () => void; isLibrary: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{drawer.title}</h2>
            <p className="text-sm text-slate-600">{drawer.description}</p>
          </div>
          <button type="button" onClick={onClose} title="Close drawer" className="rounded-lg border border-slate-300 p-2 text-slate-600">
            <Close fontSize="small" />
          </button>
        </div>

        <form className="grid gap-4 p-5 sm:grid-cols-2">
          {drawer.fields.map((field) => (
            <label key={field} className="space-y-2 text-sm font-medium text-slate-700">
              <span>{field}</span>
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" placeholder={field} />
            </label>
          ))}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <div className="flex items-center gap-3">
              {isLibrary ? <QrCode2 className="text-sky-600" /> : <Map className="text-teal-600" />}
              <div>
                <h3 className="font-semibold text-slate-900">{isLibrary ? "QR preview" : "Assignment preview"}</h3>
                <p className="text-sm text-slate-600">
                  {isLibrary ? "Next accession: BK-2026-00005. QR can be generated, previewed, printed, or bulk generated." : "Vehicle -> Driver -> Route -> Shift -> Assign history is captured on save."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export function LibraryManagement() {
  return <ModuleShell moduleKey="library" />;
}

export function TransportManagement() {
  return <ModuleShell moduleKey="transport" />;
}
