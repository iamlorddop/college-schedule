import type { ScheduleItem } from "../types";

type GroupedSchedule = Record<string, ScheduleItem[]>;

export const groupScheduleByDay = (scheduleItems: ScheduleItem[]): GroupedSchedule => {
  const grouped: GroupedSchedule = {};
  
  scheduleItems.forEach(item => {
    const dateKey = item.date || item.day_of_week;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(item);
  });
  
  return grouped;
};

export const sortScheduleByTime = (scheduleItems: ScheduleItem[]) => {
  return [...scheduleItems].sort((a, b) => {
    return a.start_time.localeCompare(b.start_time);
  });
};