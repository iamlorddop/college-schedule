import { type FC } from "react";
import { Row, Col, Card, Statistic } from "antd";
import { BookOutlined, ScheduleOutlined } from "@ant-design/icons";

import { useAuth, useApi } from "../../hooks";
import { getScheduleForGroup } from "../../api";

export const StudentDashboard: FC = () => {
  const { user } = useAuth();

  const { data: schedule, loading: scheduleLoading } = useApi(() => {
    if (user?.groupId) {
      return getScheduleForGroup(user.groupId);
    }
    return Promise.reject(new Error("Group ID is undefined"));
  });

  return (
    <div>
      <h2>Панель студента</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Дисциплин в семестре"
              value={user?.disciplinesCount || 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
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
