import { type FC } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import {
  DashboardOutlined,
  ScheduleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../hooks";

export const SideMenu: FC = () => {
  const { user } = useAuth();

  const adminItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Главная</Link>,
    },
    {
      key: "data",
      icon: <SolutionOutlined />,
      label: <Link to="/data">Управление данными</Link>,
    },
    {
      key: "schedule",
      icon: <ScheduleOutlined />,
      label: <Link to="/schedule/generate">Генерация расписания</Link>,
    },
  ];

  const teacherItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Главная</Link>,
    },
    {
      key: "schedule",
      icon: <ScheduleOutlined />,
      label: <Link to="/schedule">Мое расписание</Link>,
    },
  ];

  const studentItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Главная</Link>,
    },
    {
      key: "schedule",
      icon: <ScheduleOutlined />,
      label: <Link to="/schedule">Мое расписание</Link>,
    },
  ];

  const getMenuItems = () => {
    if (user?.role.toLowerCase() === "admin") return adminItems;
    if (user?.role.toLowerCase() === "teacher") return teacherItems;
    return studentItems;
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={["dashboard"]}
      items={getMenuItems()}
      style={{ height: "100%", borderRight: 0 }}
    />
  );
};
