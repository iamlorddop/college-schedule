import type { FC, PropsWithChildren } from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout, theme, Avatar, Dropdown, Space, Button, Drawer } from "antd";
import { UserOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";

import { SideMenu } from "./SideMenu";
import { useAuth } from "../../hooks";

const { Header, Content, Footer, Sider } = Layout;

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = [
    {
      key: "1",
      label: <Link to="/profile">Профиль</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: <span onClick={logout}>Выйти</span>,
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Десктопный Sider */}
      {!isMobile && (
        <Sider
          width={250}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          style={{
            background: "#001529",
          }}
        >
          <SideMenu />
        </Sider>
      )}

      {/* Мобильный Drawer */}
      {isMobile && (
        <Drawer
          title="Меню"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
        >
          <SideMenu />
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 24,
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ fontSize: "16px", width: 64, height: 64 }}
            />
          )}

          <Dropdown menu={{ items }}>
            <Space style={{ padding: "0 16px", cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username}</span>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          {children}
        </Content>

        <Footer style={{ textAlign: "center", padding: "16px 24px" }}>
          Экспресс-расписание ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
