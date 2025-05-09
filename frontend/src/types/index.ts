// Типы пользователей
export interface User {
	id: string;
	username: string;
	email: string;
	role: 'admin' | 'teacher' | 'student';
	token: string;
	groupId?: string;       // Для студентов
	teacherId?: string;     // Для преподавателей
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
	week_type?: 'ч' | 'з';
 }
 
 export interface Group {
	id: string;
	name: string;
	specialty: Specialty;
	course: Course;
	study_form: 'б' | 'п' | 'в';
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
	type: 'lecture' | 'lab' | 'practice';
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
	login: (credentials: { username: string; password: string; }) => Promise<User>;
	register: (userData: { username: string; email: string; password: string; role: string; }) => Promise<User>;
	logout: () => void;
 };
 
 export interface AppRoutesProps {
	user: User | null;
 }
 
 export interface ProtectedRouteProps {
	user: User | null;
	children: React.ReactNode;
	roles?: Array<'admin' | 'teacher' | 'student'>;
 }