import { type FC, useEffect, useState } from "react";
import {
  Card,
  Button,
  Select,
  DatePicker,
  Spin,
  message,
  Flex,
  Grid,
  Typography,
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import { getGroups, generateSchedule } from "../../api";
import { ScheduleView } from "../../components";
import { useApi } from "../../hooks";
import { type Group } from "../../types";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Title } = Typography;

export const ScheduleGenerator: FC = () => {
  const screens = useBreakpoint();
  const [semester, setSemester] = useState<number>(1);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs().endOf("month").add(1, "month"),
  ]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  const {
    data: groups,
    loading: groupsLoading,
    request: loadGroups,
  } = useApi(getGroups);
  const { request: generate, loading: generating } = useApi(generateSchedule);

  useEffect(() => {
    loadGroups({});
  }, []);

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
      console.error(error);
    }
  };

  return (
    <Card>
      {screens.xs ? (
        <Flex vertical gap={16}>
          <Title level={4} style={{ margin: 0 }}>
            Генерация расписания
          </Title>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={generating}
            onClick={handleGenerate}
            size="small"
            block
          >
            Сгенерировать
          </Button>
        </Flex>
      ) : (
        <Flex justify="space-between" align="center">
          <Title level={4} style={{ margin: 0 }}>
            Генерация расписания
          </Title>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={generating}
            onClick={handleGenerate}
          >
            Сгенерировать
          </Button>
        </Flex>
      )}

      <Flex vertical gap={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Flex gap={16} wrap="wrap">
          <Select
            style={{ width: screens.xs ? "100%" : 200 }}
            value={semester}
            onChange={setSemester}
            size={screens.xs ? "small" : "middle"}
          >
            <Option value={1}>1 семестр</Option>
            <Option value={2}>2 семестр</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates as [Dayjs | null, Dayjs | null])
            }
            style={{ width: screens.xs ? "100%" : 350 }}
            size={screens.xs ? "small" : "middle"}
          />
        </Flex>

        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Выберите группы"
          value={selectedGroups}
          onChange={setSelectedGroups}
          loading={groupsLoading}
          size={screens.xs ? "small" : "middle"}
          maxTagCount={screens.xs ? 1 : undefined}
          maxTagTextLength={screens.xs ? 10 : undefined}
        >
          {groups
            ?.filter((g) => g.subgroup == null)
            ?.map((group: Group) => (
              <Option key={group.id} value={group.id}>
                {group.name}
              </Option>
            ))}
        </Select>
      </Flex>

      {generating && (
        <Flex justify="center" style={{ marginTop: 24 }}>
          <Spin tip="Генерация расписания..." size="large" />
        </Flex>
      )}

      <div style={{ marginTop: 16 }}>
        <ScheduleView />
      </div>
    </Card>
  );
};
