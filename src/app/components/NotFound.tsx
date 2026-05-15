import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-gray-900">Page not found</h2>
      <p className="text-sm text-gray-600 mt-2">We couldn't find the page you were looking for.</p>
      <div className="mt-6">
        <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg">Go to Dashboard</Link>
      </div>
    </div>
  );
}
