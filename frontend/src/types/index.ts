export type TRole = "admin" | "teacher" | "student";

// Типы пользователей
export interface User {
  id?: string;
  username: string;
  email: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  role: TRole;
  token?: string;
  groupId?: string; // Для студентов
  teacherId?: string; // Для преподавателей
  disciplinesCount?: number; // Для преподавателей
  groupsCount?: number; // Для преподавателей
}

// Типы данных расписания
export interface ScheduleItem {
  id: string;
  date?: string;
  week_type?: "ч" | "з";
  teaching_load: {
    discipline: string;
    teacher: string;
    group: string;
  };
  time_slot: {
    start_time: string;
    end_time: string;
    day_of_week: number;
  };
  classroom: {
    number: string;
  };
}
export interface ScheduleConflict {
  time_slot: string;
  classroom: string;
  week_type: string | null;
  date: string | null;
  schedules: ScheduleItem[];
  count: number;
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
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Discipline {
  id: string;
  name: string;
  specialty: Specialty;
}

export interface TeachingLoad {
  id: string;
  discipline_id: string;
  group_id: string;
  teacher_id: string;
  teacher: string;
  total_hours: number;
  self_study_hours: number;
  current_year_hours: number;
  semester1_hours: number;
  semester2_hours: number;
  hours_to_issue: number;
  course_design_hours: number;
  semester1_exams: number;
  semester2_exams: number;
  course_work_check_hours: number;
  consultations_hours: number;
  dp_review_hours: number;
  dp_guidance_hours: number;
  total_teaching_hours: number;
  master_training_hours: number;
  advanced_level_hours: number;
  notebook_check_10_percent: number;
  notebook_check_15_percent: number;
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
  register: (userData: AuthResponse | User) => Promise<AuthResponse>;
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
