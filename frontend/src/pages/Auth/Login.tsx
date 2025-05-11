import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { type AuthResponse } from "../../types";
import { useAuth } from "../../hooks";

export const Login: FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: AuthResponse) => {
    try {
      setLoading(true);
      await login(values);
      message.success("Вход выполнен успешно");
      navigate("/");
    } catch (error) {
      message.error("Неверные учетные данные");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 50 }}>
      <Card title="Вход в систему">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Введите имя пользователя" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            Или <Link to="/register">зарегистрируйтесь</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
