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
  updateProfile,
} from "../api";
import { type User, type AuthContextType, type AuthResponse } from "../types";

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

  const login = useCallback(async (credentials: AuthResponse) => {
    const userData = await apiLogin(credentials);
    setUser(userData.user);
    return userData;
  }, []);

  const register = useCallback(
    async (userData: AuthResponse | User): Promise<AuthResponse> => {
      try {
        const response = await apiRegister(userData as AuthResponse);
        setUser(response.user);
        return response;
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const updateUser = useCallback(
    async (
      updatedFields: Partial<
        Omit<
          User,
          | "id"
          | "token"
          | "role"
          | "groupId"
          | "teacherId"
          | "disciplinesCount"
          | "groupsCount"
        >
      >
    ) => {
      if (!user) return;
      const updatedUser = await updateProfile(updatedFields);
      setUser(updatedUser);
    },
    [user]
  );

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
