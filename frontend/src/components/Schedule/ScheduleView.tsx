import { type FC, useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Input,
  Card,
  Spin,
  Alert,
  Button,
  DatePicker,
  Select,
  Tag,
  Space,
  Pagination,
} from "antd";
import {
  CalendarOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { saveAs } from "file-saver";

dayjs.extend(isBetween);

import {
  generateReport,
  getGroups,
  getSchedule,
  getScheduleForTeacher,
  getScheduleForGroup,
  getDisciplines,
  getTeachers,
} from "../../api";
import { useAuth } from "../../hooks";
import {
  type Discipline,
  type Group,
  type ScheduleItem,
  type Teacher,
} from "../../types";

const { RangePicker } = DatePicker;
const { Option } = Select;

const groupByDayOfWeek = (schedule: ScheduleItem[]) => {
  const days = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const result: Record<number, ScheduleItem[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  schedule.forEach((item) => {
    const day = item.time_slot?.day_of_week ?? 0;
    if (day >= 1 && day <= 6) {
      // 1-6 = Пн-Сб
      result[day - 1].push(item);
    }
  });

  // Сортируем занятия по времени в каждом дне
  Object.values(result).forEach((daySchedule) => {
    daySchedule.sort((a, b) => {
      const aTime = a.time_slot?.start_time || "";
      const bTime = b.time_slot?.start_time || "";
      return aTime.localeCompare(bTime);
    });
  });

  return { days, scheduleByDay: result };
};

export const ScheduleView: FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("week"),
    dayjs().endOf("week"),
  ]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [noDataAvailable, setNoDataAvailable] = useState<boolean>(false);
  const pageSize = 10;

  const fetchInitialData = async () => {
    try {
      const [groupsRes, teachersRes, disciplinesRes] = await Promise.all([
        getGroups(),
        getTeachers(),
        getDisciplines(),
      ]);

      setGroups(groupsRes.data);
      setTeachers(teachersRes.data);
      setDisciplines(disciplinesRes.data);
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setNoDataAvailable(false);
      let response;

      await fetchInitialData();

      if (user?.role.toLowerCase() === "admin") {
        response = await getSchedule({
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
          groupId: selectedGroup || undefined,
        });
      } else if (user?.role.toLowerCase() === "teacher") {
        response = await getScheduleForTeacher(user.teacherId!);
      } else if (user?.groupId) {
        response = await getScheduleForGroup(user.groupId!, {
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
        });
      }

      if (response) {
        const filteredData = response.data.filter((item: ScheduleItem) => {
          if (!item.date) return false;
          const itemDate = dayjs(item.date);
          return itemDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
        });

        setSchedule(filteredData);
        setNoDataAvailable(filteredData.length === 0);
      } else {
        setSchedule([]);
        setNoDataAvailable(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "pdf" | "xlsx") => {
    try {
      if (!user) return;

      const params: {
        startDate: string;
        endDate: string;
        groupId?: string;
        teacherId?: string;
      } = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      };

      if (user.role.toLowerCase() === "admin" && selectedGroup) {
        params.groupId = selectedGroup;
      } else if (user.role.toLowerCase() === "teacher") {
        params.teacherId = user.teacherId;
      } else {
        params.groupId = user.groupId;
      }

      const response = await generateReport(format, params);
      saveAs(response.data, `schedule.${format}`);
    } catch (err) {
      console.error("Export error:", err);
    }
  };
  const getGroupNameMemoized = useCallback(
    (id: string): string => {
      const group = groups.find((g) => g.id === id);
      return group
        ? `${group.name}${
            group.subgroup ? ` (подгруппа ${group.subgroup})` : ""
          }`
        : `Группа (ID: ${id})`;
    },
    [groups]
  );

  const getDisciplineNameMemoized = useCallback(
    (id: string): string => {
      const discipline = disciplines.find((d) => d.id === id);
      return discipline ? discipline.name : `Дисциплина (ID: ${id})`;
    },
    [disciplines]
  );

  const getTeacherNameMemoized = useCallback(
    (id: string): string => {
      const teacher = teachers.find((t) => t.id === id);
      return teacher
        ? `${teacher.last_name} ${teacher.first_name[0]}.${
            teacher.middle_name ? ` ${teacher.middle_name[0]}.` : ""
          }`
        : `Преподаватель (ID: ${id})`;
    },
    [teachers]
  );

  useEffect(() => {
    fetchSchedule();
  }, [dateRange, selectedGroup]);

  useEffect(() => {
    if (user?.role.toLowerCase() === "admin") {
      getGroups().then((response) => {
        setGroups(response.data);
        if (response.data.length > 0) {
          setSelectedGroup(response.data[0].id);
        }
      });
    }
  }, [user?.role]);

  // Функция для подсветки совпадений
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} style={{ backgroundColor: "#ffeb3b" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredSchedule = useMemo(() => {
    if (!searchTerm) return schedule;

    const searchLower = searchTerm.toLowerCase();

    return schedule.filter((item) => {
      if (
        (item.date && item.date.toLowerCase().includes(searchLower)) ||
        (item.week_type &&
          item.week_type.toLowerCase().includes(searchLower)) ||
        (item.classroom?.number &&
          item.classroom.number.toLowerCase().includes(searchLower))
      ) {
        return true;
      }

      if (item.teaching_load) {
        const groupName = getGroupNameMemoized(
          item.teaching_load.group
        ).toLowerCase();
        const disciplineName = getDisciplineNameMemoized(
          item.teaching_load.discipline
        ).toLowerCase();
        const teacherName = getTeacherNameMemoized(
          item.teaching_load.teacher
        ).toLowerCase();

        if (
          groupName.includes(searchLower) ||
          disciplineName.includes(searchLower) ||
          teacherName.includes(searchLower)
        ) {
          return true;
        }
      }

      if (item.time_slot) {
        if (
          item.time_slot.start_time.toLowerCase().includes(searchLower) ||
          item.time_slot.end_time.toLowerCase().includes(searchLower)
        ) {
          return true;
        }
      }

      return false;
    });
  }, [
    schedule,
    searchTerm,
    getGroupNameMemoized,
    getDisciplineNameMemoized,
    getTeacherNameMemoized,
  ]);

  // Группировка с учетом подсветки
  const { days, scheduleByDay } = useMemo(
    () => groupByDayOfWeek(filteredSchedule),
    [filteredSchedule]
  );

  const columns = [
    {
      title: "Время",
      dataIndex: "time",
      key: "time",
      width: 100,
      fixed: "left" as const,
    },
    ...days.map((day, index) => ({
      title: highlightSearchTerm(day),
      dataIndex: `day${index}`,
      key: `day${index}`,
      render: (item: ScheduleItem | null) => {
        if (!item) return null;

        const disciplineName = getDisciplineNameMemoized(
          item.teaching_load.discipline
        );
        const groupName = getGroupNameMemoized(item.teaching_load.group);
        const teacherName = getTeacherNameMemoized(item.teaching_load.teacher);
        const classroomNumber = item.classroom?.number || "-";
        const date = item.date ? dayjs(item.date).format("DD.MM.YYYY") : "";

        return (
          <div style={{ padding: 8 }}>
            <div style={{ width: 220 }}>
              <strong>{highlightSearchTerm(disciplineName)}</strong>
            </div>
            <div>Группа: {highlightSearchTerm(groupName)}</div>
            <div>Преподаватель: {highlightSearchTerm(teacherName)}</div>
            <div>Аудитория: {highlightSearchTerm(classroomNumber)}</div>
            <div>
              <Tag color={item.week_type === "ч" ? "blue" : "orange"}>
                {item.week_type === "ч" ? "Четная" : "Нечетная"}
              </Tag>
              {date && ` (${highlightSearchTerm(date)})`}
            </div>
          </div>
        );
      },
    })),
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleGroupChange = (value: string | null) => {
    setSelectedGroup(value);
    setSchedule([]);
  };

  const tableData = useMemo(() => {
    const timeSlots = new Set<string>();
    Object.values(scheduleByDay).forEach((daySchedule) => {
      daySchedule.forEach((item) => {
        if (item.time_slot) {
          timeSlots.add(
            `${item.time_slot.start_time}-${item.time_slot.end_time}`
          );
        }
      });
    });

    const sortedTimeSlots = Array.from(timeSlots).sort((a, b) =>
      a.localeCompare(b)
    );

    return sortedTimeSlots.map((time) => {
      const row: Record<string, any> = { time, key: time };

      days.forEach((_, dayIndex) => {
        const daySchedule = scheduleByDay[dayIndex];
        const item = daySchedule.find(
          (s) => `${s.time_slot?.start_time}-${s.time_slot?.end_time}` === time
        );
        row[`day${dayIndex}`] = item || null;
      });

      return row;
    });
  }, [scheduleByDay, days]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, currentPage]);

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          <span>Расписание</span>
        </div>
      }
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Input
          placeholder="Поиск по дисциплине, группе, преподавателю..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        {user?.role.toLowerCase() === "admin" && (
          <Select<string>
            style={{ width: 200 }}
            value={selectedGroup}
            onChange={handleGroupChange}
            placeholder="Выберите группу"
          >
            {groups.map((group) => (
              <Option key={group.id} value={group.id}>
                {group.name}
                {group.subgroup ? ` (подгруппа ${group.subgroup})` : ""}
              </Option>
            ))}
          </Select>
        )}

        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates) {
              setDateRange([
                dates[0] || dayjs().startOf("week"),
                dates[1] || dayjs().endOf("week"),
              ]);
            } else {
              setDateRange([dayjs().startOf("week"), dayjs().endOf("week")]);
            }
          }}
          style={{ width: 250 }}
          defaultValue={[dayjs().startOf("week"), dayjs().endOf("week")]}
        />

        <Space.Compact>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportReport("pdf")}
          >
            PDF
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportReport("xlsx")}
          >
            Excel
          </Button>
        </Space.Compact>
      </div>
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {noDataAvailable && !loading && (
        <Alert
          message="Нет данных для отображения"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="time"
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
          style={{ marginBottom: 16 }}
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            current={currentPage}
            total={tableData.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </Spin>
    </Card>
  );
};
