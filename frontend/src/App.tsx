import { type FC } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";
import ruRU from "antd/lib/locale/ru_RU";

import { AuthProvider } from "./contexts";
import { AppRoutes } from "./routes";

const App: FC = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;
