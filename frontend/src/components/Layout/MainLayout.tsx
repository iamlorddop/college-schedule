import type { FC, PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { Layout, theme, Avatar, Dropdown, Space } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

import { SideMenu } from "./SideMenu";
import { useAuth } from "../../hooks";

const { Header, Content, Footer, Sider } = Layout;

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
      <Sider
        width={300}
        style={{
          background: "#001529",
        }}
      >
        <SideMenu />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingRight: 24,
          }}
        >
          <Dropdown menu={{ items }}>
            <Space>
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
          }}
        >
          {children}
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Экспресс-расписание ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
