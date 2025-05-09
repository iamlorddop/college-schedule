import { type FC, useState } from "react";
import { Card, Button, Select, DatePicker, Spin, message } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import { getGroups, generateSchedule } from "../../api";
import { useApi } from "../../hooks";
import { type Group } from "../../types";

const { Option } = Select;
const { RangePicker } = DatePicker;

export const ScheduleGenerator: FC = () => {
  const [semester, setSemester] = useState<number>(1);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs().endOf("month").add(1, "month"),
  ]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  const { data: groups, loading: groupsLoading } = useApi(getGroups);
  const { request: generate, loading: generating } = useApi(generateSchedule);

  const handleGenerate = async () => {
    try {
      if (!dateRange[0] || !dateRange[1]) {
        message.error("Пожалуйста, выберите диапазон дат");
        return;
      }

      await generate({
        semester,
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        groupIds: selectedGroups,
      });
      message.success("Расписание успешно сгенерировано");
    } catch (error) {
      message.error("Ошибка при генерации расписания");
      throw error;
    }
  };

  return (
    <Card
      title="Генерация расписания"
      extra={
        <Button
          type="primary"
          icon={<SyncOutlined />}
          loading={generating}
          onClick={handleGenerate}
        >
          Сгенерировать
        </Button>
      }
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Select style={{ width: 200 }} value={semester} onChange={setSemester}>
          <Option value={1}>1 семестр</Option>
          <Option value={2}>2 семестр</Option>
        </Select>

        <RangePicker
          value={dateRange}
          onChange={(dates) =>
            setDateRange(dates as [Dayjs | null, Dayjs | null])
          }
          style={{ width: 350 }}
        />
      </div>

      <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Выберите группы"
        value={selectedGroups}
        onChange={setSelectedGroups}
        loading={groupsLoading}
      >
        {groups?.map((group: Group) => (
          <Option key={group.id} value={group.id}>
            {group.name}
          </Option>
        ))}
      </Select>

      {generating && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Spin tip="Генерация расписания..." size="large" />
        </div>
      )}
    </Card>
  );
};
