import { type FC, useEffect, useState } from "react";
import {
  Form,
  Modal,
  Input,
  message,
  Switch,
  Space,
  Typography,
  Button,
} from "antd";
import { createTeacher, updateTeacher } from "../../../api";
import { type Teacher, type TRole } from "../../../types";
import { useAuth } from "../../../hooks";

interface TeacherFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  teacher: Teacher | null;
}

interface TeacherFormValues {
  last_name: string;
  first_name: string;
  middle_name: string;
  user_email?: string;
  user_username?: string;
  user_password?: string;
}

export const TeacherForm: FC<TeacherFormProps> = ({
  open,
  onCancel,
  onSuccess,
  teacher,
}) => {
  const { register } = useAuth();
  const [form] = Form.useForm<TeacherFormValues>();
  const [loading, setLoading] = useState(false);
  const [createUser, setCreateUser] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  useEffect(() => {
    if (teacher) {
      form.setFieldsValue({
        last_name: teacher.last_name,
        first_name: teacher.first_name,
        middle_name: teacher.middle_name,
        user_email: teacher.user?.email,
        user_username: teacher.user?.username,
      });
      setCreateUser(!!teacher.user);
    } else {
      form.resetFields();
      setCreateUser(false);
      setGeneratedPassword("");
    }
  }, [teacher, form]);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    form.setFieldsValue({ user_password: password });
    return password;
  };

  const handleRegister = async (
    teacherId: string,
    values: TeacherFormValues
  ) => {
    if (!values.user_email || !values.user_username) {
      message.error("Email и логин обязательны для создания учетной записи");
      return;
    }

    try {
      const password = values.user_password || generatePassword();
      const registerValues = {
        username: values.user_username,
        email: values.user_email,
        last_name: values.last_name,
        first_name: values.first_name,
        middle_name: values.middle_name,
        password: password,
        role: "teacher" as TRole,
        teacherId,
      };
      await register(registerValues);

      message.success("Учетная запись преподавателя создана");
    } catch (error) {
      message.error("Ошибка при создании учетной записи");
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Подготовка данных преподавателя (без user данных)
      const teacherData = {
        last_name: values.last_name,
        first_name: values.first_name,
        middle_name: values.middle_name,
      };

      if (teacher) {
        // Обновляем преподавателя
        await updateTeacher(teacher.id, teacherData);
        message.success("Преподаватель обновлен");

        // Создаем/обновляем учетную запись если нужно
        if (createUser) {
          await handleRegister(teacher.id, values);
        }
      } else {
        // Создаем нового преподавателя
        const response = await createTeacher(teacherData);
        message.success("Преподаватель создан");

        // Создаем учетную запись если нужно
        if (createUser) {
          await handleRegister(response.data.id, values);
        }
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error("Ошибка при сохранении");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={teacher ? "Редактировать преподавателя" : "Добавить преподавателя"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="last_name"
          label="Фамилия"
          rules={[{ required: true, message: "Введите фамилию" }]}
        >
          <Input placeholder="Иванов" />
        </Form.Item>

        <Form.Item
          name="first_name"
          label="Имя"
          rules={[{ required: true, message: "Введите имя" }]}
        >
          <Input placeholder="Иван" />
        </Form.Item>

        <Form.Item name="middle_name" label="Отчество">
          <Input placeholder="Иванович" />
        </Form.Item>

        <Form.Item label="Создать учетную запись">
          <Switch
            checked={createUser}
            onChange={setCreateUser}
            checkedChildren="Да"
            unCheckedChildren="Нет"
          />
        </Form.Item>

        {createUser && (
          <>
            <Form.Item
              name="user_email"
              label="Email"
              rules={[
                { required: true, message: "Введите email" },
                { type: "email", message: "Неверный формат email" },
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item
              name="user_username"
              label="Логин"
              rules={[{ required: true, message: "Введите логин" }]}
            >
              <Input placeholder="Логин" />
            </Form.Item>

            <Form.Item
              name="user_password"
              label="Пароль"
              rules={[
                { required: !generatedPassword, message: "Введите пароль" },
              ]}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input.Password placeholder="Пароль" />
                <Typography.Text type="secondary">
                  {generatedPassword &&
                    `Сгенерированный пароль: ${generatedPassword}`}
                </Typography.Text>
                <Button
                  type="dashed"
                  onClick={generatePassword}
                  style={{ width: "100%" }}
                >
                  Сгенерировать пароль
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};
