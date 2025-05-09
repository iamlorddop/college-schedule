import type { Teacher, TimeSlot } from "../types";

export const formatTeacherName = (teacher: Teacher) => {
	if (!teacher) return '';
	const { last_name, first_name, middle_name } = teacher;
	return `${last_name} ${first_name?.[0]}.${middle_name?.[0]}.`;
 };
 
 export const formatTimeSlot = (timeSlot: TimeSlot) => {
	if (!timeSlot) return '';
	return `${timeSlot.start_time}-${timeSlot.end_time}`;
 };
 
 export const formatDate = (date: string | Date) => {
	if (!date) return '';
	return new Date(date).toLocaleDateString('ru-RU');
 };