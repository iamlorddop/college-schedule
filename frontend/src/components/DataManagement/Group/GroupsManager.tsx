import { useEffect, useState, type FC } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { GroupForm } from "./GroupForm";
import { type Group } from "../../../types";
import {
  getGroups,
  deleteGroup,
  getSpecialties,
  getCourses,
} from "../../../api";
import { useApi } from "../../../hooks";

const { Option } = Select;

export const GroupsManager: FC = () => {
  const { data: groupsRaw, loading, request: refresh } = useApi(getGroups);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // Справочники
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [dictsLoaded, setDictsLoaded] = useState(false);

  // Состояния поиска
  const [searchName, setSearchName] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState<string | undefined>(
    undefined
  );
  const [searchCourse, setSearchCourse] = useState<string | undefined>(
    undefined
  );
  const [searchStudyForm, setSearchStudyForm] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    refresh({});
  }, []);

  useEffect(() => {
    // Загрузка справочников
    const fetchDicts = async () => {
      try {
        const [specRes, courseRes] = await Promise.all([
          getSpecialties(),
          getCourses(),
        ]);
        setSpecialties(specRes.data);
        setCourses(courseRes.data);
        setDictsLoaded(true);
      } catch (error) {
        message.error("Ошибка загрузки справочников");
        throw error;
      }
    };
    fetchDicts();
  }, []);

  // Сопоставление specialty и course по id
  const groups = (groupsRaw || []).map((g: any) => {
    let specialty = g.specialty;
    let course = g.course;
    // Если это id, ищем объект в справочнике
    if (typeof specialty === "string" || typeof specialty === "number") {
      specialty = specialties.find((s) => s.id === g.specialty) || {};
    }
    if (typeof course === "string" || typeof course === "number") {
      course = courses.find((c) => c.id === g.course) || {};
    }
    return {
      ...g,
      specialty,
      course,
    };
  });

  // Фильтрация по поисковым полям
  const filteredGroups = groups.filter((group) => {
    const matchesName =
      !searchName ||
      group.name.toLowerCase().includes(searchName.trim().toLowerCase());
    const matchesSpecialty =
      !searchSpecialty ||
      (group.specialty && String(group.specialty.id) === searchSpecialty);
    const matchesCourse =
      !searchCourse ||
      (group.course && String(group.course.id) === searchCourse);
    const matchesStudyForm =
      !searchStudyForm || group.study_form === searchStudyForm;
    return matchesName && matchesSpecialty && matchesCourse && matchesStudyForm;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup(id);
      message.success("Группа удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении группы");
      throw error;
    }
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Специальность",
      dataIndex: ["specialty", "name"],
      key: "specialty",
      render: (_: any, record: any) =>
        record.specialty && record.specialty.name
          ? `${record.specialty.code ? record.specialty.code + " - " : ""}${
              record.specialty.name
            }`
          : "—",
    },
    {
      title: "Курс",
      dataIndex: ["course", "number"],
      key: "course",
      render: (_: any, record: any) =>
        record.course && record.course.number
          ? `${record.course.number} курс`
          : "—",
    },
    {
      title: "Форма обучения",
      dataIndex: "study_form",
      key: "study_form",
      render: (form: string) => {
        const forms = { б: "Бюджет", п: "Коммерция", в: "Вечернее" };
        return forms[form as keyof typeof forms] || "—";
      },
    },
    {
      title: "Подгруппа",
      dataIndex: "subgroup",
      key: "subgroup",
      render: (subgroup: number | undefined) =>
        subgroup ? `${subgroup} подгруппа` : "—",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Group) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentGroup(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить группу?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentGroup(null);
            setModalOpen(true);
          }}
        >
          Добавить группу
        </Button>
      </div>

      {/* Фильтры поиска */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Input
            placeholder="Поиск по названию"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select
            placeholder="Специальность"
            value={searchSpecialty}
            onChange={setSearchSpecialty}
            allowClear
            style={{ width: "100%" }}
            loading={!dictsLoaded}
          >
            {specialties.map((spec) => (
              <Option key={spec.id} value={String(spec.id)}>
                {spec.code ? `${spec.code} - ` : ""}
                {spec.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select
            placeholder="Курс"
            value={searchCourse}
            onChange={setSearchCourse}
            allowClear
            style={{ width: "100%" }}
            loading={!dictsLoaded}
          >
            {courses.map((course) => (
              <Option key={course.id} value={String(course.id)}>
                {course.number} курс
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select
            placeholder="Форма обучения"
            value={searchStudyForm}
            onChange={setSearchStudyForm}
            allowClear
            style={{ width: "100%" }}
          >
            <Option value="б">Бюджет</Option>
            <Option value="п">Коммерция</Option>
            <Option value="в">Вечернее</Option>
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={dictsLoaded ? filteredGroups : []}
        rowKey="id"
        loading={loading || !dictsLoaded}
      />

      <GroupForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        group={currentGroup}
      />
    </div>
  );
};
