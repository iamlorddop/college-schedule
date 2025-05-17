import { useEffect, type FC } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

import { useApi } from "../../hooks";
import { WorkloadReport } from "../../components";
import { getDisciplines, getSchedule, getTeachers, getGroups } from "../../api";

export const AdminDashboard: FC = () => {
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
    <div>
      <h2>Панель администратора</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Групп"
              value={groups?.filter((g) => g.subgroup == null)?.length}
              prefix={<TeamOutlined />}
              loading={groupsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Преподавателей"
              value={teachers?.length}
              prefix={<UserOutlined />}
              loading={teachersLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Дисциплин"
              value={uniqueDisciplineNames.length}
              prefix={<BookOutlined />}
              loading={disciplinesLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
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

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <WorkloadReport />
        </Col>
      </Row>
    </div>
  );
};
