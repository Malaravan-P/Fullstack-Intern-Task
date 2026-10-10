import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Remember where the user was headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
