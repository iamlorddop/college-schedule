import { useEffect, useState, type FC } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Select,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { TeachingLoadForm } from "./TeachingLoadForm";
import { type TeachingLoad } from "../../../types";
import {
  getTeachingLoads,
  deleteTeachingLoad,
  getDisciplines,
  getGroups,
  getTeachers,
} from "../../../api";
import { useApi } from "../../../hooks";

const { Option } = Select;

export const TeachingLoadsManager: FC = () => {
  const {
    data: loadsRaw,
    loading,
    request: refresh,
  } = useApi(getTeachingLoads);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLoad, setCurrentLoad] = useState<TeachingLoad | null>(null);

  // Справочники
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [dictsLoaded, setDictsLoaded] = useState(false);

  // Состояния поиска
  const [searchDiscipline, setSearchDiscipline] = useState<
    string | undefined
  >();
  const [searchGroup, setSearchGroup] = useState<string | undefined>();
  const [searchTeacher, setSearchTeacher] = useState<string | undefined>();

  useEffect(() => {
    refresh({});
  }, []);

  useEffect(() => {
    const fetchDicts = async () => {
      try {
        const [discRes, groupsRes, teachersRes] = await Promise.all([
          getDisciplines(),
          getGroups(),
          getTeachers(),
        ]);
        setDisciplines(discRes.data);
        setGroups(groupsRes.data);
        setTeachers(teachersRes.data);
        setDictsLoaded(true);
      } catch (error) {
        message.error("Ошибка загрузки справочников");
        throw error;
      }
    };
    fetchDicts();
  }, []);

  // Сопоставление данных
  const loads = (loadsRaw || []).map((load: any) => {
    let discipline = load.discipline;
    let group = load.group;
    let teacher = load.teacher;

    if (typeof discipline === "string" || typeof discipline === "number") {
      discipline = disciplines.find((d) => d.id === load.discipline) || {};
    }
    if (typeof group === "string" || typeof group === "number") {
      group = groups.find((g) => g.id === load.group) || {};
    }
    if (typeof teacher === "string" || typeof teacher === "number") {
      teacher = teachers.find((t) => t.id === load.teacher) || {};
    }

    return {
      ...load,
      discipline,
      group,
      teacher,
    };
  });

  // Фильтрация
  const filteredLoads = loads.filter((load) => {
    const matchesDiscipline =
      !searchDiscipline ||
      (load.discipline && String(load.discipline.id) === searchDiscipline);
    const matchesGroup =
      !searchGroup || (load.group && String(load.group.id) === searchGroup);
    const matchesTeacher =
      !searchTeacher ||
      (load.teacher && String(load.teacher.id) === searchTeacher);

    return matchesDiscipline && matchesGroup && matchesTeacher;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteTeachingLoad(id);
      message.success("Нагрузка удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении нагрузки");
      throw error;
    }
  };

  const columns = [
    {
      title: "Дисциплина",
      dataIndex: ["discipline", "name"],
      key: "discipline",
    },
    {
      title: "Группа",
      dataIndex: ["group", "name"],
      key: "group",
    },
    {
      title: "Преподаватель",
      dataIndex: ["teacher", "short_name"],
      key: "teacher",
    },
    {
      title: "Часы (1 сем.)",
      dataIndex: "semester1_hours",
      key: "semester1",
      render: (hours: number) => hours || "—",
    },
    {
      title: "Часы (2 сем.)",
      dataIndex: "semester2_hours",
      key: "semester2",
      render: (hours: number) => hours || "—",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: TeachingLoad) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentLoad(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить нагрузку?"
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
            setCurrentLoad(null);
            setModalOpen(true);
          }}
        >
          Добавить нагрузку
        </Button>
      </div>

      {/* Фильтры поиска */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Дисциплина"
            value={searchDiscipline}
            onChange={setSearchDiscipline}
            allowClear
            style={{ width: "100%" }}
            loading={!dictsLoaded}
          >
            {disciplines.map((disc) => (
              <Option key={disc.id} value={String(disc.id)}>
                {disc.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Группа"
            value={searchGroup}
            onChange={setSearchGroup}
            allowClear
            style={{ width: "100%" }}
            loading={!dictsLoaded}
          >
            {groups.map((group) => (
              <Option key={group.id} value={String(group.id)}>
                {group.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Преподаватель"
            value={searchTeacher}
            onChange={setSearchTeacher}
            allowClear
            style={{ width: "100%" }}
            loading={!dictsLoaded}
          >
            {teachers.map((teacher) => (
              <Option key={teacher.id} value={String(teacher.id)}>
                {teacher.short_name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={dictsLoaded ? filteredLoads : []}
        rowKey="id"
        loading={loading || !dictsLoaded}
        scroll={{ x: true }}
      />

      <TeachingLoadForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        load={currentLoad}
      />
    </div>
  );
};
