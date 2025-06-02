import { type FC, useState, useEffect } from "react";
import {
  Table,
  Card,
  Spin,
  Alert,
  Button,
  DatePicker,
  Select,
  Tag,
  Space,
} from "antd";
import { CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { saveAs } from "file-saver";

import {
  generateReport,
  getGroups,
  getSchedule,
  getScheduleForTeacher,
  getScheduleForGroup,
} from "../../api";
import { useAuth } from "../../hooks";
import { type Group, type ScheduleItem } from "../../types";

const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      let response;

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
        setSchedule(response.data);
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

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date?: string) =>
        date ? dayjs(date).format("DD.MM.YYYY") : "-",
    },
    {
      title: "День недели",
      dataIndex: "day_of_week",
      key: "day_of_week",
    },
    {
      title: "Время",
      key: "time",
      render: (_: unknown, record: ScheduleItem) =>
        `${record.start_time}-${record.end_time}`,
    },
    {
      title: "Дисциплина",
      dataIndex: "discipline",
      key: "discipline",
    },
    ...(user?.role.toLowerCase() !== "teacher"
      ? [
          {
            title: "Преподаватель",
            dataIndex: "teacher",
            key: "teacher",
          },
        ]
      : []),
    {
      title: "Аудитория",
      dataIndex: "classroom",
      key: "classroom",
    },
    {
      title: "Тип недели",
      dataIndex: "week_type",
      key: "week_type",
      render: (type?: "ч" | "з") =>
        type ? (
          <Tag color={type === "ч" ? "blue" : "orange"}>
            {type === "ч" ? "Четная" : "Нечетная"}
          </Tag>
        ) : null,
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          <span>Расписание</span>
        </div>
      }
      extra={
        <div style={{ display: "flex", gap: 16 }}>
          {user?.role.toLowerCase() === "admin" && (
            <Select<string>
              style={{ width: 200 }}
              value={selectedGroup}
              onChange={setSelectedGroup}
              placeholder="Выберите группу"
            >
              {groups.map((group) => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          )}

          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
            style={{ width: 250 }}
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
      }
    >
      {error && <Alert message={error} type="error" showIcon />}
      <Spin spinning={loading}>
        <Table<ScheduleItem>
          columns={columns}
          dataSource={schedule}
          rowKey="id"
          pagination={false}
        />
      </Spin>
    </Card>
  );
};
