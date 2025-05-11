import { type FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

import {
  AdminDashboard,
  DataManagement,
  ScheduleGenerator,
  TeacherDashboard,
  StudentDashboard,
  Login,
  Register,
  NotFoundPage,
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
  const { user, loading } = useAuth();

  // Обработка состояния загрузки
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

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
        {/* Общие маршруты для всех авторизованных */}
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user} roles={["admin", "teacher", "student"]}>
              {user.role.toLowerCase() === "admin" ? (
                <AdminDashboard />
              ) : user.role.toLowerCase() === "teacher" ? (
                <TeacherDashboard />
              ) : (
                <StudentDashboard />
              )}
            </ProtectedRoute>
          }
        />

        {/* Маршруты для студента и преподавателя*/}
        <Route
          path="/schedule"
          element={
            <ProtectedRoute user={user} roles={["teacher", "student"]}>
              <ScheduleView />
            </ProtectedRoute>
          }
        />

        {/* Маршруты для админа */}
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

        {/* Fallback для авторизованных пользователей */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};
