import { useEffect, type FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, Spin, Alert, Tabs, Grid, Typography } from "antd";

import { useApi } from "../../../hooks";
import { getTeachingLoads, getTeachers } from "../../../api";
import { type TeachingLoad, type Teacher } from "../../../types";
import { formatTeacherName } from "../../../utils";

const { TabPane } = Tabs;
const { useBreakpoint } = Grid;
const { Text } = Typography;

interface TeacherWorkload {
  teacher: Teacher;
  semester1: number;
  semester2: number;
  exams: number;
  consultations: number;
  courseWorks: number;
  diplomaWorks: number;
  total: number;
}

interface TeachersWorkloadReportProps {
  teacherId?: string;
}

export const WorkloadReport: FC<TeachersWorkloadReportProps> = ({
  teacherId,
}) => {
  const screens = useBreakpoint();
  const {
    data: teachingLoadsData,
    error: teachingLoadsError,
    loading: teachingLoadsLoading,
    request: requestTeachingLoads,
  } = useApi(getTeachingLoads);

  const {
    data: teachersData,
    error: teachersError,
    loading: teachersLoading,
    request: requestTeachers,
  } = useApi(getTeachers);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([requestTeachingLoads({}), requestTeachers({})]);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const transformData = (
    loads: TeachingLoad[],
    teachers: Teacher[]
  ): TeacherWorkload[] => {
    const teacherMap = new Map<string, Teacher>();
    teachers.forEach((teacher) => {
      teacherMap.set(teacher.id, teacher);
    });

    const workloadMap: Record<string, TeacherWorkload> = {};

    loads
      .filter((load) => !teacherId || load.teacher === teacherId)
      .forEach((load) => {
        const teacher = teacherMap.get(load.teacher);
        if (!teacher) return;

        if (!workloadMap[load.teacher]) {
          workloadMap[load.teacher] = {
            teacher,
            semester1: 0,
            semester2: 0,
            exams: 0,
            consultations: 0,
            courseWorks: 0,
            diplomaWorks: 0,
            total: 0,
          };
        }

        const teacherWorkload = workloadMap[load.teacher];
        teacherWorkload.semester1 += load.semester1_hours || 0;
        teacherWorkload.semester2 += load.semester2_hours || 0;
        teacherWorkload.exams +=
          (load.semester1_exams || 0) + (load.semester2_exams || 0);
        teacherWorkload.consultations += load.consultations_hours || 0;
        teacherWorkload.courseWorks += load.course_work_check_hours || 0;
        teacherWorkload.diplomaWorks +=
          (load.dp_review_hours || 0) + (load.dp_guidance_hours || 0);
        teacherWorkload.total +=
          teacherWorkload.semester1 +
          teacherWorkload.semester2 +
          teacherWorkload.exams +
          teacherWorkload.consultations +
          teacherWorkload.courseWorks +
          teacherWorkload.diplomaWorks;
      });

    return Object.values(workloadMap).sort((a, b) => b.total - a.total);
  };

  const chartData =
    teachingLoadsData && teachersData
      ? transformData(teachingLoadsData, teachersData)
      : [];

  const loading = teachingLoadsLoading || teachersLoading;
  const error = teachingLoadsError || teachersError;

  const renderChart = (dataKeys: string[]) => (
    <ResponsiveContainer width="100%" height={screens.xs ? 300 : 400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: screens.xs ? 0 : 30,
          left: screens.xs ? 0 : 20,
          bottom: screens.xs ? 40 : 70,
        }}
        layout={screens.xs ? "vertical" : "horizontal"}
      >
        {screens.xs ? (
          <YAxis
            type="category"
            dataKey="teacher"
            width={100}
            tickFormatter={(teacher: Teacher) =>
              formatTeacherName(teacher)
                .split(" ")
                .map((part, i) => (i === 0 ? part : part.charAt(0) + "."))
                .join(" ")
            }
            tick={{ fontSize: 12 }}
          />
        ) : (
          <XAxis
            type="category"
            dataKey="teacher"
            angle={-45}
            textAnchor="end"
            height={70}
            tickFormatter={(teacher: Teacher) => formatTeacherName(teacher)}
            tick={{ fontSize: 12 }}
          />
        )}
        {screens.xs ? <XAxis type="number" /> : <YAxis type="number" />}
        <Tooltip
          formatter={(value: number) => [`${value} часов`, ""]}
          labelFormatter={(label) => {
            const teacher = chartData.find(
              (t) => formatTeacherName(t.teacher) === label
            )?.teacher;
            return teacher ? formatTeacherName(teacher) : label;
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: screens.xs ? "20px" : "0",
            overflow: "scroll",
            height: screens.xs ? "100px" : "auto",
          }}
        />
        {dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getBarColor(key)}
            name={getBarName(key)}
            barSize={screens.xs ? 15 : 30}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  if (loading) {
    return <Spin tip="Загрузка данных..." />;
  }

  if (error) {
    return <Alert message="Ошибка загрузки" type="error" />;
  }

  if (!chartData.length) {
    return <Alert message="Нет данных" type="info" />;
  }

  return (
    <Card
      title={
        <Text
          ellipsis={{
            tooltip: `Нагрузка преподавателей${teacherId ? "" : " (все)"}`,
          }}
        >
          Нагрузка преподавателей{teacherId ? "" : " (все)"}
        </Text>
      }
      bodyStyle={{ padding: screens.xs ? "8px" : "16px" }}
    >
      <Tabs
        defaultActiveKey="semesters"
        size={screens.xs ? "small" : "middle"}
        tabPosition={screens.xs ? "top" : "top"}
      >
        <TabPane tab="Семестры" key="semesters">
          {renderChart(["semester1", "semester2"])}
        </TabPane>
        <TabPane tab="Доп.нагрузки" key="additional">
          {renderChart([
            "exams",
            "consultations",
            "courseWorks",
            "diplomaWorks",
          ])}
        </TabPane>
        <TabPane tab="Общая" key="total">
          {renderChart(["total"])}
        </TabPane>
      </Tabs>
    </Card>
  );
};

// Вспомогательные функции
const getBarColor = (key: string) => {
  const colors: Record<string, string> = {
    semester1: "#1890ff",
    semester2: "#52c41a",
    exams: "#faad14",
    consultations: "#f5222d",
    courseWorks: "#722ed1",
    diplomaWorks: "#13c2c2",
    total: "#fa8c16",
  };
  return colors[key] || "#000";
};

const getBarName = (key: string) => {
  const names: Record<string, string> = {
    semester1: "1 сем.",
    semester2: "2 сем.",
    exams: "Экзамены",
    consultations: "Консульт.",
    courseWorks: "Курсовые",
    diplomaWorks: "Дипломные",
    total: "Всего",
  };
  return names[key] || key;
};
