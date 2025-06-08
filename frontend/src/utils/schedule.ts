import type { ScheduleItem } from "../types";

type GroupedSchedule = Record<string, ScheduleItem[]>;

export const groupScheduleByDay = (
  scheduleItems: ScheduleItem[]
): GroupedSchedule => {
  const grouped: GroupedSchedule = {};

  scheduleItems.forEach((item) => {
    const dateKey = item.date || item.time_slot.day_of_week;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(item);
  });

  return grouped;
};

export const sortScheduleByTime = (scheduleItems: ScheduleItem[]) => {
  return [...scheduleItems].sort((a, b) => {
    return a.time_slot.start_time.localeCompare(b.time_slot.start_time);
  });
};
