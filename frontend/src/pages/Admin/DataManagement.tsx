import { type FC, useState } from "react";
import { Tabs, Card } from "antd";

import {
  GroupsManager,
  TeachersManager,
  DisciplinesManager,
  SpecialtiesManager,
} from "../../components";

const { TabPane } = Tabs;

export const DataManagement: FC = () => {
  const [activeTab, setActiveTab] = useState("groups");

  return (
    <Card title="Управление данными">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Группы" key="groups">
          <GroupsManager />
        </TabPane>
        <TabPane tab="Преподаватели" key="teachers">
          <TeachersManager />
        </TabPane>
        <TabPane tab="Дисциплины" key="disciplines">
          <DisciplinesManager />
        </TabPane>
        <TabPane tab="Специальности" key="specialties">
          <SpecialtiesManager />
        </TabPane>
      </Tabs>
    </Card>
  );
};
