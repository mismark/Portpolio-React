import { Navigate } from "react-router-dom";

/**
 * Wraps any route that requires admin authentication.
 * Checks for the JWT token in localStorage — if missing, redirects to /admin.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
