import { type FC } from "react";
import { Navigate } from "react-router-dom";

import { type ProtectedRouteProps, type Role } from "../../types";

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  user,
  children,
  roles,
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length < 1 && !roles.includes(user.role.toLowerCase() as Role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
