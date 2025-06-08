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
import { Card, Spin, Alert, Tabs } from "antd";

import { useApi } from "../../../hooks";
import { getTeachingLoads, getTeachers } from "../../../api";
import { type TeachingLoad, type Teacher } from "../../../types";
import { formatTeacherName } from "../../../utils";

const { TabPane } = Tabs;

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
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="teacher"
          angle={-45}
          textAnchor="end"
          height={70}
          tickFormatter={(teacher: Teacher) => formatTeacherName(teacher)}
        />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value} часов`, ""]}
          labelFormatter={(label) => {
            const teacher = chartData.find(
              (t) => formatTeacherName(t.teacher) === label
            )?.teacher;
            return teacher ?? label;
          }}
        />
        <Legend />
        {dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getBarColor(key)}
            name={getBarName(key)}
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
    <Card title={`Нагрузка преподавателей${teacherId ? "" : " (все)"}`}>
      <Tabs defaultActiveKey="semesters">
        <TabPane tab="По семестрам" key="semesters">
          {renderChart(["semester1", "semester2"])}
        </TabPane>
        <TabPane tab="Доп. нагрузки" key="additional">
          {renderChart([
            "exams",
            "consultations",
            "courseWorks",
            "diplomaWorks",
          ])}
        </TabPane>
        <TabPane tab="Общая нагрузка" key="total">
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
    semester1: "1 семестр",
    semester2: "2 семестр",
    exams: "Экзамены",
    consultations: "Консультации",
    courseWorks: "Курсовые",
    diplomaWorks: "Дипломные",
    total: "Всего",
  };
  return names[key] || key;
};
