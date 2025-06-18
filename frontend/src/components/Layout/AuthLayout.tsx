import { type FC, type PropsWithChildren } from "react";
import { Layout, Space, Typography } from "antd";
import { Link } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", textAlign: "center" }}>
        <Space>
          <Link to="/">
            <Title
              level={1}
              style={{
                color: "#1890ff",
                margin: 0,
                fontSize: "clamp(18px, 4vw, 24px)", // Адаптивный размер шрифта
              }}
            >
              Экспресс-расписание
            </Title>
          </Link>
        </Space>
      </Header>
      <Content
        style={{
          padding: "50px 16px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Колледж ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};
