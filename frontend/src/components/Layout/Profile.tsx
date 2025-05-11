import { type FC, useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Descriptions,
  Button,
  Form,
  Input,
  message,
  Divider,
  Modal,
} from "antd";
import { UserOutlined, MailOutlined, EditOutlined } from "@ant-design/icons";

import { useAuth } from "../../hooks";
import { changePassword } from "../../api";

const { Title } = Typography;

export const Profile: FC = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const isAdmin = user?.role.toLowerCase() === "admin";

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      await updateUser(values);
      message.success("Профиль успешно обновлён");
      setEditMode(false);
    } catch (error) {
      message.error("Ошибка при обновлении профиля");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Смена пароля
  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      await changePassword(values);
      message.success("Пароль успешно изменён");
      setPasswordModal(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error("Ошибка при смене пароля");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <Avatar size={48} icon={<UserOutlined />} />
          <Title level={4} style={{ margin: 0 }}>
            {user?.last_name} {user?.first_name} {user?.middle_name}
          </Title>
        </Space>
      }
      extra={
        <Space>
          {!isAdmin && (
            <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
              Редактировать
            </Button>
          )}
          <Button onClick={() => setPasswordModal(true)}>Сменить пароль</Button>
        </Space>
      }
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      {!editMode || isAdmin ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Фамилия">
            {user?.last_name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Имя">
            {user?.first_name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Отчество">
            {user?.middle_name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              {user?.email || "—"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Роль">
            {user?.role || "—"}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            last_name: user?.last_name,
            first_name: user?.first_name,
            middle_name: user?.middle_name,
          }}
          onFinish={handleSave}
        >
          <Form.Item
            label="Фамилия"
            name="last_name"
            rules={[{ required: true, message: "Введите фамилию" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Имя"
            name="first_name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Отчество" name="middle_name">
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сохранить
              </Button>
              <Button onClick={() => setEditMode(false)} disabled={loading}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      <Modal
        title="Смена пароля"
        open={passwordModal}
        onCancel={() => setPasswordModal(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="Старый пароль"
            name="oldPassword"
            rules={[{ required: true, message: "Введите старый пароль" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              { required: true, message: "Введите новый пароль" },
              { min: 6, message: "Минимум 6 символов" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Подтверждение нового пароля"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Подтвердите новый пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сменить пароль
              </Button>
              <Button
                onClick={() => setPasswordModal(false)}
                disabled={loading}
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Divider />
    </Card>
  );
};
