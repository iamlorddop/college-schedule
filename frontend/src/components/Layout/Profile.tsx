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
  Grid,
  List,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks";
import { changePassword } from "../../api";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export const Profile: FC = () => {
  const { user, updateUser } = useAuth();
  const screens = useBreakpoint();
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

  const profileActions = [
    !isAdmin && {
      key: "edit",
      icon: <EditOutlined />,
      label: "Редактировать",
      onClick: () => setEditMode(true),
    },
    {
      key: "password",
      icon: <LockOutlined />,
      label: "Сменить пароль",
      onClick: () => setPasswordModal(true),
    },
  ].filter(Boolean);

  return (
    <Card
      style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}
      bodyStyle={{ padding: screens.xs ? 12 : 24 }}
    >
      <Space
        direction={screens.xs ? "vertical" : "horizontal"}
        align="center"
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Avatar size={screens.xs ? 64 : 48} icon={<UserOutlined />} />
        <Title
          level={4}
          style={{ margin: 0, textAlign: screens.xs ? "center" : "left" }}
        >
          {user?.last_name} {user?.first_name} {user?.middle_name}
        </Title>
      </Space>

      {screens.xs ? (
        <List
          itemLayout="horizontal"
          dataSource={profileActions}
          renderItem={(item: any) => (
            <List.Item>
              <Button icon={item.icon} onClick={item.onClick} block>
                {item.label}
              </Button>
            </List.Item>
          )}
        />
      ) : (
        <Space style={{ marginBottom: 16 }}>
          {profileActions.map((item: any) => (
            <Button key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Button>
          ))}
        </Space>
      )}

      {!editMode || isAdmin ? (
        <Descriptions
          column={1}
          bordered
          size={screens.xs ? "small" : "default"}
        >
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
              <Text>{user?.email || "—"}</Text>
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
            <Input size={screens.xs ? "small" : "middle"} />
          </Form.Item>
          <Form.Item
            label="Имя"
            name="first_name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input size={screens.xs ? "small" : "middle"} />
          </Form.Item>
          <Form.Item label="Отчество" name="middle_name">
            <Input size={screens.xs ? "small" : "middle"} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size={screens.xs ? "small" : "middle"}
              >
                Сохранить
              </Button>
              <Button
                onClick={() => setEditMode(false)}
                disabled={loading}
                size={screens.xs ? "small" : "middle"}
              >
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
        width={screens.xs ? "90%" : "50%"}
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
            <Input.Password size={screens.xs ? "small" : "middle"} />
          </Form.Item>
          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              { required: true, message: "Введите новый пароль" },
              { min: 6, message: "Минимум 6 символов" },
            ]}
          >
            <Input.Password size={screens.xs ? "small" : "middle"} />
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
            <Input.Password size={screens.xs ? "small" : "middle"} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size={screens.xs ? "small" : "middle"}
              >
                Сменить пароль
              </Button>
              <Button
                onClick={() => setPasswordModal(false)}
                disabled={loading}
                size={screens.xs ? "small" : "middle"}
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
