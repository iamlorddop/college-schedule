import { type FC } from "react";
import { Card, Avatar, Typography, Space, Descriptions } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";

import { useAuth } from "../../hooks";

const { Title } = Typography;

export const Profile: FC = () => {
  const { user } = useAuth();

  return (
    <Space
      direction="vertical"
      style={{ width: "100%", alignItems: "center", marginTop: 40 }}
    >
      <Card
        style={{ width: 400, textAlign: "center" }}
        cover={
          <Avatar
            size={96}
            icon={<UserOutlined />}
            style={{ margin: "24px auto" }}
          />
        }
      >
        <Title level={3}>{user?.username || "Пользователь"}</Title>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Фамилия">
            {user?.last_name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Имя">
            {user?.first_name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Отчество">
            {user?.middle_name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Логин">
            {user?.username || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <MailOutlined /> {user?.email || "Нет email"}
          </Descriptions.Item>
          <Descriptions.Item label="Роль">
            <b>{user?.role || "Неизвестно"}</b>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};
