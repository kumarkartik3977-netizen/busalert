import type { Notification, ETAResult } from "../types";

export function generateNotifications(eta: ETAResult, busNumber: string, delay: number): Notification[] {
  const notifications: Notification[] = [];
  const now = Date.now();

  if (eta.minutes <= 2) {
    notifications.push({
      id: `arriving-${now}`,
      type: "success",
      title: "Bus arriving",
      message: `Bus #${busNumber} is arriving at your stop now.`,
      timestamp: now,
      read: false,
    });
  } else if (eta.shouldLeaveNow) {
    notifications.push({
      id: `leave-${now}`,
      type: "warning",
      title: "Leave now!",
      message: `Bus #${busNumber} arriving in approximately ${eta.minutes} minutes. Start walking to your stop.`,
      timestamp: now,
      read: false,
    });
  } else if (eta.minutes <= 10) {
    notifications.push({
      id: `approaching-${now}`,
      type: "info",
      title: "Bus approaching",
      message: `Bus #${busNumber} is ${eta.minutes} minutes away. You can leave in ${eta.timeToLeave} minutes.`,
      timestamp: now,
      read: false,
    });
  }

  if (delay > 5) {
    notifications.push({
      id: `delay-${now}`,
      type: "warning",
      title: "Bus delayed",
      message: `Bus #${busNumber} is running approximately ${delay} minutes late.`,
      timestamp: now,
      read: false,
    });
  }

  return notifications;
}
