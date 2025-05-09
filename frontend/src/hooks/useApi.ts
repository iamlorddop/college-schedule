import { useState } from 'react';
import { type AxiosResponse } from 'axios';

type ApiFunction<T> = (params: Record<string, any>) => Promise<AxiosResponse<T>>;

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  request: ApiFunction<T>;
}

export const useApi = <T = unknown>(apiFunc: ApiFunction<T>): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const request = async (params: Record<string, any>): Promise<AxiosResponse<T>> => {
    setLoading(true);
    try {
      const result = await apiFunc(params);
      setData(result.data);
      setError(null);
      return result;
    } catch (err) {
      setError('Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, request };
}; 