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
  Grid,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

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
const { useBreakpoint } = Grid;
const { Text } = Typography;

export const GroupsManager: FC = () => {
  const screens = useBreakpoint();
  const { data: groupsRaw, loading, request: refresh } = useApi(getGroups);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

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
        console.error(error);
      }
    };
    fetchDicts();
  }, []);

  const groups = (groupsRaw || []).map((g: any) => {
    let specialty = g.specialty;
    let course = g.course;
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
      console.error(error);
    }
  };

  const handleExpand = (expanded: boolean, record: Group) => {
    const keys = expanded
      ? [...expandedRowKeys, record.id]
      : expandedRowKeys.filter((key) => key !== record.id);
    setExpandedRowKeys(keys);
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }}>{text}</Text>
      ),
    },
    ...(screens.md
      ? [
          {
            title: "Специальность",
            dataIndex: ["specialty", "name"],
            key: "specialty",
            render: (_: any, record: any) => (
              <Text ellipsis={{ tooltip: record.specialty?.name }}>
                {record.specialty && record.specialty.name
                  ? `${
                      record.specialty.code ? record.specialty.code + " - " : ""
                    }${record.specialty.name}`
                  : "—"}
              </Text>
            ),
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
        ]
      : []),
    {
      title: "Действия",
      key: "actions",
      width: screens.xs ? 100 : undefined,
      render: (_: any, record: Group) => (
        <Space size={screens.xs ? "small" : "middle"}>
          <Button
            size={screens.xs ? "small" : "middle"}
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentGroup(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить группу?"
            onConfirm={() => handleDelete(record.id)}
            placement={screens.xs ? "top" : "left"}
          >
            <Button
              size={screens.xs ? "small" : "middle"}
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: Group) => (
    <Card size="small" style={{ margin: screens.xs ? "-12px -8px" : 0 }}>
      <Row gutter={[16, 8]}>
        <Col span={24}>
          <Text strong>Специальность: </Text>
          {record.specialty && record.specialty.name
            ? `${record.specialty.code ? record.specialty.code + " - " : ""}${
                record.specialty.name
              }`
            : "—"}
        </Col>
        <Col span={24}>
          <Text strong>Курс: </Text>
          {record.course && record.course.number
            ? `${record.course.number} курс`
            : "—"}
        </Col>
        <Col span={24}>
          <Text strong>Форма обучения: </Text>
          {record.study_form === "б"
            ? "Бюджет"
            : record.study_form === "п"
            ? "Коммерция"
            : record.study_form === "в"
            ? "Вечернее"
            : "—"}
        </Col>
        <Col span={24}>
          <Text strong>Подгруппа: </Text>
          {record.subgroup ? `${record.subgroup} подгруппа` : "—"}
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: screens.xs ? "8px" : "16px" }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentGroup(null);
                setModalOpen(true);
              }}
              size={screens.xs ? "small" : "middle"}
            >
              {screens.xs ? "Добавить" : "Добавить группу"}
            </Button>
          </Col>
          <Col flex={screens.xs ? "100%" : "auto"}>
            <Input
              placeholder="Поиск по названию"
              prefix={<SearchOutlined />}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
              size={screens.xs ? "small" : "middle"}
              style={{ width: screens.xs ? "100%" : 200 }}
            />
          </Col>
        </Row>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Специальность"
                  value={searchSpecialty}
                  onChange={setSearchSpecialty}
                  allowClear
                  style={{ width: "100%" }}
                  loading={!dictsLoaded}
                  size={screens.xs ? "small" : "middle"}
                >
                  {specialties.map((spec) => (
                    <Option key={spec.id} value={String(spec.id)}>
                      {spec.code ? `${spec.code} - ` : ""}
                      {spec.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Курс"
                  value={searchCourse}
                  onChange={setSearchCourse}
                  allowClear
                  style={{ width: "100%" }}
                  loading={!dictsLoaded}
                  size={screens.xs ? "small" : "middle"}
                >
                  {courses.map((course) => (
                    <Option key={course.id} value={String(course.id)}>
                      {course.number} курс
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Форма обучения"
                  value={searchStudyForm}
                  onChange={setSearchStudyForm}
                  allowClear
                  style={{ width: "100%" }}
                  size={screens.xs ? "small" : "middle"}
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
              size={screens.xs ? "small" : "middle"}
              scroll={{ x: true }}
              expandable={{
                expandedRowRender: screens.md ? undefined : expandedRowRender,
                rowExpandable: () => !screens.md,
                expandedRowKeys,
                onExpand: handleExpand,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                size: "default",
                simple: screens.xs,
              }}
            />
          </Space>
        </Card>
      </Space>

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
