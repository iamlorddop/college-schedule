import { type FC } from "react";
import { Navigate } from "react-router-dom";

import { type User } from "../../types";

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactElement;
  roles?: Array<"admin" | "teacher" | "student">;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  user,
  children,
  roles,
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
