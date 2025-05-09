import { type FC } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

import { useApi } from "../../hooks";
import { getDisciplines, getSchedule, getTeachers, getGroups } from "../../api";

export const AdminDashboard: FC = () => {
  const { data: groups, loading: groupsLoading } = useApi(getGroups);
  const { data: teachers, loading: teachersLoading } = useApi(getTeachers);
  const { data: disciplines, loading: disciplinesLoading } =
    useApi(getDisciplines);
  const { data: schedule, loading: scheduleLoading } = useApi(getSchedule);

  return (
    <div>
      <h2>Панель администратора</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Групп"
              value={groups?.length}
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
              value={disciplines?.length}
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
    </div>
  );
};
