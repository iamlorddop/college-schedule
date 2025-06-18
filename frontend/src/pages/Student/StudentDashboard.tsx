import { type FC } from "react";
import { Row, Col, Card, Statistic, Grid } from "antd";
import { BookOutlined, ScheduleOutlined } from "@ant-design/icons";

import { useAuth, useApi } from "../../hooks";
import { getScheduleForGroup } from "../../api";

const { useBreakpoint } = Grid;

export const StudentDashboard: FC = () => {
  const { user } = useAuth();
  const screens = useBreakpoint();

  const { data: schedule, loading: scheduleLoading } = useApi(() => {
    if (user?.groupId) {
      return getScheduleForGroup(user.groupId);
    }
    return Promise.reject(new Error("Group ID is undefined"));
  });

  // Responsive column configuration
  const colProps = {
    xs: 24, // Full width on extra small screens
    sm: 24, // Full width on small screens
    md: 12, // Half width on medium screens
    lg: 12, // Half width on large screens
    xl: 12, // Half width on extra large screens
  };

  return (
    <div>
      <h2>Панель студента</h2>
      <Row
        gutter={[
          screens.xs ? 8 : 16, // Horizontal gutter
          screens.xs ? 8 : 16, // Vertical gutter for mobile
        ]}
      >
        <Col {...colProps}>
          <Card>
            <Statistic
              title="Дисциплин в семестре"
              value={user?.disciplinesCount || 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col {...colProps}>
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
