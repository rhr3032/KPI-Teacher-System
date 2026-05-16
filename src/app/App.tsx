import { useMemo, useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthContext, type AuthSession, type UserRole } from "./auth";

const AUTH_STORAGE_KEY = "kpi_teacher_auth_session";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string; name: string }> = {
  admin: {
    email: "admin@kpi.edu",
    password: "admin123",
    name: "Admin User",
  },
  teacher: {
    email: "teacher@kpi.edu",
    password: "teacher123",
    name: "Demo Teacher",
  },
};

function getInitialSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.role || !parsed?.email || !parsed?.name) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function LoginScreen({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState(DEMO_CREDENTIALS.admin.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.admin.password);
  const [error, setError] = useState("");

  const selectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setEmail(DEMO_CREDENTIALS[nextRole].email);
    setPassword(DEMO_CREDENTIALS[nextRole].password);
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const demo = DEMO_CREDENTIALS[role];
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== demo.email || password !== demo.password) {
      setError(`Invalid credentials for ${role}. Use the demo credentials shown below.`);
      return;
    }

    onLogin({ role, email: demo.email, name: demo.name });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Teacher System Login</h1>
          <p className="text-sm text-gray-600 mt-1">Choose a portal, then sign in with demo credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </label>

          <div className="pt-1">
            <p className="text-sm font-medium text-gray-700 mb-2">Portal</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => selectRole("admin")}
                className={`px-4 py-2 rounded-lg border ${
                  role === "admin"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => selectRole("teacher")}
                className={`px-4 py-2 rounded-lg border ${
                  role === "teacher"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Teacher
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Sign In
          </button>
        </form>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 space-y-1">
          <p className="font-semibold">Demo Credentials</p>
          <p>Admin: admin@kpi.edu / admin123</p>
          <p>Teacher: teacher@kpi.edu / teacher123</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getInitialSession());

  const login = (nextSession: AuthSession) => {
    setSession(nextSession);
    saveSession(nextSession);
  };

  const logout = () => {
    setSession(null);
    saveSession(null);
  };

  const authContextValue = useMemo(
    () => (session ? { session, logout } : null),
    [session],
  );

  if (!session || !authContextValue) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}