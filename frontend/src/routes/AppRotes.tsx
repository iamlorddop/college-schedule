import { type FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  AdminDashboard,
  DataManagement,
  ScheduleGenerator,
  TeacherDashboard,
  StudentDashboard,
  Login,
  Register,
} from "../pages";
import {
  ScheduleView,
  MainLayout,
  AuthLayout,
  ProtectedRoute,
  Profile,
} from "../components";
import { useAuth } from "../hooks";

export const AppRoutes: FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthLayout>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/profile" element={<Profile />} />

        {user.role === "admin" && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data"
              element={
                <ProtectedRoute user={user} roles={["admin"]}>
                  <DataManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule/generate"
              element={
                <ProtectedRoute user={user} roles={["admin"]}>
                  <ScheduleGenerator />
                </ProtectedRoute>
              }
            />
          </>
        )}

        {user.role === "teacher" && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} roles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute user={user} roles={["teacher"]}>
                  <ScheduleView />
                </ProtectedRoute>
              }
            />
          </>
        )}

        {user.role === "student" && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} roles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute user={user} roles={["student"]}>
                  <ScheduleView />
                </ProtectedRoute>
              }
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};
