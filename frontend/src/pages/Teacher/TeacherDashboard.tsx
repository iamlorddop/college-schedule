import { type FC } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  BookOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { useAuth, useApi } from "../../hooks";
import { getScheduleForTeacher } from "../../api";

export const TeacherDashboard: FC = () => {
  const { user } = useAuth();

  const { data: schedule, loading: scheduleLoading } = useApi(() => {
    if (user?.teacherId) {
      return getScheduleForTeacher(user.teacherId);
    }
    return Promise.reject(new Error("Teacher ID is undefined"));
  });

  return (
    <div>
      <h2>Панель преподавателя</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Дисциплин"
              value={user?.disciplinesCount || 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Групп"
              value={user?.groupsCount || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Занятий на неделю"
              value={schedule?.length || 0}
              prefix={<ScheduleOutlined />}
              loading={scheduleLoading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
