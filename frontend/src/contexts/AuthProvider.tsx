import {
  type FC,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from "react";

import { AuthContext } from "./AuthContext";
import {
  getCurrentUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api";
import { type User, type AuthContextType } from "../types";

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      const userData = await apiLogin(credentials);
      setUser(userData);
      return userData;
    },
    []
  );

  const register = useCallback(
    async (userData: {
      username: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const newUser = await apiRegister(userData);
      setUser(newUser);
      return newUser;
    },
    []
  );

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
