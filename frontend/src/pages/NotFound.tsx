import { type FC } from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

/**
 * NotFoundPage отображает ошибку 404
 */
export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Страница не найдена"
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          На главную
        </Button>
      }
    />
  );
};
