import { useEffect, useState, type FC, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Select,
  Grid,
  Flex,
  Card,
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
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { useBreakpoint } = Grid;

export const TeachingLoadsManager: FC = () => {
  const screens = useBreakpoint();
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
        console.error(error);
      }
    };
    fetchDicts();
  }, []);

  // Сопоставление и фильтрация данных
  const loads = useMemo(() => {
    return (loadsRaw || []).map((load: any) => {
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
  }, [loadsRaw, disciplines, groups, teachers]);

  const filteredLoads = useMemo(() => {
    return loads.filter((load) => {
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
  }, [loads, searchDiscipline, searchGroup, searchTeacher]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTeachingLoad(id);
      message.success("Нагрузка удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении нагрузки");
      console.error(error);
    }
  };

  const columns: ColumnsType<TeachingLoad> = [
    {
      title: "Дисциплина",
      dataIndex: ["discipline", "name"],
      key: "discipline",
      responsive: ["md"],
    },
    {
      title: "Группа",
      dataIndex: ["group", "name"],
      key: "group",
      responsive: ["sm"],
    },
    {
      title: "Преподаватель",
      dataIndex: ["teacher", "short_name"],
      key: "teacher",
    },
    {
      title: screens.md ? "Часы (1 сем.)" : "1 сем.",
      dataIndex: "semester1_hours",
      key: "semester1",
      render: (hours: number) => hours || "—",
      responsive: ["sm"],
    },
    {
      title: screens.md ? "Часы (2 сем.)" : "2 сем.",
      dataIndex: "semester2_hours",
      key: "semester2",
      render: (hours: number) => hours || "—",
      responsive: ["sm"],
    },
    {
      title: "Действия",
      key: "actions",
      width: 110,
      fixed: screens.xs ? "right" : undefined,
      render: (_, record: TeachingLoad) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentLoad(record);
              setModalOpen(true);
            }}
            size="small"
          />
          <Popconfirm
            title="Удалить нагрузку?"
            onConfirm={() => handleDelete(record.id)}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Flex vertical gap={16} style={{ marginBottom: 16 }}>
        <Card size="small">
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentLoad(null);
                setModalOpen(true);
              }}
              size={screens.xs ? "small" : "middle"}
            >
              {screens.xs ? "Добавить" : "Добавить нагрузку"}
            </Button>

            <Flex
              gap={16}
              wrap="wrap"
              style={{ flex: 1, minWidth: screens.xs ? "100%" : 300 }}
            >
              <Select
                placeholder="Дисциплина"
                value={searchDiscipline}
                onChange={setSearchDiscipline}
                allowClear
                style={{ width: "100%", minWidth: 120 }}
                loading={!dictsLoaded}
                size={screens.xs ? "small" : "middle"}
              >
                {disciplines.map((disc) => (
                  <Option key={disc.id} value={String(disc.id)}>
                    {disc.name}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Группа"
                value={searchGroup}
                onChange={setSearchGroup}
                allowClear
                style={{ width: "100%", minWidth: 120 }}
                loading={!dictsLoaded}
                size={screens.xs ? "small" : "middle"}
              >
                {groups.map((group) => (
                  <Option key={group.id} value={String(group.id)}>
                    {group.name}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Преподаватель"
                value={searchTeacher}
                onChange={setSearchTeacher}
                allowClear
                style={{ width: "100%", minWidth: 140 }}
                loading={!dictsLoaded}
                size={screens.xs ? "small" : "middle"}
              >
                {teachers.map((teacher) => (
                  <Option key={teacher.id} value={String(teacher.id)}>
                    {teacher.short_name}
                  </Option>
                ))}
              </Select>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      <Table
        columns={columns}
        dataSource={dictsLoaded ? filteredLoads : []}
        rowKey="id"
        loading={loading || !dictsLoaded}
        scroll={{ x: true }}
        size={screens.xs ? "small" : "middle"}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          responsive: true,
          size: screens.xs ? "small" : "default",
        }}
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
