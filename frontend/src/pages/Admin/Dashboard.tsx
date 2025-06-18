import { useEffect, type FC } from "react";
import { Row, Col, Card, Statistic, Typography, Grid } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

import { useApi } from "../../hooks";
import { WorkloadReport } from "../../components";
import { getDisciplines, getSchedule, getTeachers, getGroups } from "../../api";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export const AdminDashboard: FC = () => {
  const screens = useBreakpoint();
  const {
    data: groups,
    loading: groupsLoading,
    request: loadGroups,
  } = useApi(getGroups);
  const {
    data: teachers,
    loading: teachersLoading,
    request: loadTeachers,
  } = useApi(getTeachers);
  const {
    data: disciplines,
    loading: disciplinesLoading,
    request: loadDisciplines,
  } = useApi(getDisciplines);
  const {
    data: schedule,
    loading: scheduleLoading,
    request: loadSchedule,
  } = useApi(getSchedule);

  useEffect(() => {
    loadGroups({});
    loadTeachers({});
    loadDisciplines({});
    loadSchedule({});
  }, []);

  // Уникальные дисциплины по названию
  const uniqueDisciplineNames = Array.from(
    new Set((disciplines || []).map((d) => d.name.trim()))
  );

  return (
    <div style={{ padding: screens.xs ? "8px" : "16px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Панель администратора
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="Групп"
              value={groups?.filter((g) => g.subgroup == null)?.length}
              prefix={<TeamOutlined />}
              loading={groupsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="Преподавателей"
              value={teachers?.length}
              prefix={<UserOutlined />}
              loading={teachersLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="Дисциплин"
              value={uniqueDisciplineNames.length}
              prefix={<BookOutlined />}
              loading={disciplinesLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="Занятий в расписании"
              value={schedule?.length}
              prefix={<ScheduleOutlined />}
              loading={scheduleLoading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <WorkloadReport />
        </Col>
      </Row>
    </div>
  );
};
