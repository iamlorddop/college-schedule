import { type FC, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "antd";
import {
  DashboardOutlined,
  ScheduleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../hooks";

type MenuItem = {
  key: string;
  icon: ReactNode;
  label: ReactNode;
};
type MenuItemWithPath = MenuItem & { path: string };

export const SideMenu: FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminItems: MenuItemWithPath[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Главная</Link>,
      path: "/",
    },
    {
      key: "data",
      icon: <SolutionOutlined />,
      label: <Link to="/data">Управление данными</Link>,
      path: "/data",
    },
    {
      key: "schedule",
      icon: <ScheduleOutlined />,
      label: <Link to="/schedule/generate">Генерация расписания</Link>,
      path: "/schedule/generate",
    },
  ];

  const teacherItems: MenuItemWithPath[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Главная</Link>,
      path: "/",
    },
    {
      key: "schedule",
      icon: <ScheduleOutlined />,
      label: <Link to="/schedule">Мое расписание</Link>,
      path: "/schedule",
    },
  ];

  const studentItems: MenuItemWithPath[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Главная</Link>,
      path: "/",
    },
    {
      key: "schedule",
      icon: <ScheduleOutlined />,
      label: <Link to="/schedule">Мое расписание</Link>,
      path: "/schedule",
    },
  ];

  const getMenuItems = (): MenuItemWithPath[] => {
    if (user?.role.toLowerCase() === "admin") return adminItems;
    if (user?.role.toLowerCase() === "teacher") return teacherItems;
    return studentItems;
  };

  // Определяем активный ключ на основе текущего маршрута
  const menuItemsWithPath = getMenuItems();
  const currentPath = location.pathname;

  const selectedKey =
    menuItemsWithPath.find(
      (item) =>
        currentPath === item.path ||
        (item.path !== "/" && currentPath.startsWith(item.path))
    )?.key || "";

  // Передаём только нужные поля в Menu
  const menuItems: MenuItem[] = menuItemsWithPath.map(
    ({ key, icon, label }) => ({
      key,
      icon,
      label,
    })
  );

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      style={{ height: "100%", borderRight: 0 }}
    />
  );
};
