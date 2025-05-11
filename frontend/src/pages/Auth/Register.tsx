import { type FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Select } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

import { useAuth } from "../../hooks";
import { type AuthResponse } from "../../types";

const { Option } = Select;

export const Register: FC = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: AuthResponse) => {
    try {
      setLoading(true);
      await register(values);
      message.success("Регистрация прошла успешно");
      navigate("/");
    } catch (error) {
      message.error("Ошибка при регистрации");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 50 }}>
      <Card title="Регистрация">
        <Form form={form} name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Введите имя пользователя" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Некорректный email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 6, message: "Пароль должен быть не менее 6 символов" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Подтвердите пароль"
            />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: "Выберите роль" }]}
          >
            <Select placeholder="Выберите роль">
              <Option value="student">Студент</Option>
              <Option value="teacher">Преподаватель</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            Уже есть аккаунт? <Link to="/login">Войдите</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
