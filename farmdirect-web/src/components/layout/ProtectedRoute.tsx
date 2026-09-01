import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";

export function ProtectedRoute({
  children,
  role,
  allowAnyRole = false,
}: {
  children: ReactNode;
  role?: Role;
  allowAnyRole?: boolean;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!allowAnyRole && role && user.role !== role && user.role !== "admin") {
    const fallback = user.role === "farmer" ? "/farmer/dashboard" : "/marketplace";
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}
