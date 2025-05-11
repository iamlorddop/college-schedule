// Типы пользователей
export interface User {
  id: string;
  username: string;
  email: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  role: "admin" | "teacher" | "student";
  token: string;
  groupId?: string; // Для студентов
  teacherId?: string; // Для преподавателей
  disciplinesCount?: number; // Для преподавателей
  groupsCount?: number; // Для преподавателей
}

// Типы данных расписания
export interface ScheduleItem {
  id: string;
  date?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  discipline: string;
  teacher: string;
  classroom: string;
  week_type?: "ч" | "з";
}

export interface Group {
  id: string;
  name: string;
  specialty: Specialty;
  course: Course;
  study_form: "б" | "п" | "в";
  subgroup?: number;
}

export interface Specialty {
  id: string;
  name: string;
  code?: string;
}

export interface Course {
  id: string;
  number: number;
}

export interface Teacher {
  id: string;
  last_name: string;
  first_name: string;
  middle_name?: string;
}

export interface Discipline {
  id: string;
  name: string;
  specialty: Specialty;
}

export interface TeachingLoad {
  id: string;
  discipline: Discipline;
  group: Group;
  teacher: Teacher;
  semester1_hours?: number;
  semester2_hours?: number;
  // ... другие поля нагрузки
}

export interface Classroom {
  id: string;
  number: string;
  capacity?: number;
  type: "lecture" | "lab" | "practice";
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

// Пропсы компонентов
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentials: AuthResponse) => Promise<AuthResponse>;
  register: (userData: AuthResponse) => Promise<AuthResponse>;
  logout: () => void;
  /**
   * Обновляет данные пользователя (например, ФИО)
   * @param updatedFields - поля для обновления
   */
  updateUser: (
    updatedFields: Partial<
      Pick<User, "last_name" | "first_name" | "middle_name">
    >
  ) => Promise<void>;
};

export interface AuthResponse {
  user: User;
  access: string; // JWT access token
  refresh?: string; // JWT refresh token (не всегда нужен)
}

export interface AppRoutesProps {
  user: User | null;
}

export type Role = "admin" | "teacher" | "student";

export interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
  roles: Array<Role>;
}
