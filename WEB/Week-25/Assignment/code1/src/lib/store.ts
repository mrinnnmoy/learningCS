// In-memory store — resets on server restart (no DB needed for this assignment)

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
}

const users: User[] = [];
const notifications: Notification[] = [];
let nextUserId = 1;
let nextNotifId = 1;

export const store = {
  addUser: (name: string, email: string): User => {
    const user: User = {
      id: nextUserId++,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },
  getUsers: (): User[] => [...users],

  addNotification: (userId: number, message: string): Notification => {
    const notif: Notification = {
      id: nextNotifId++,
      userId,
      message,
      createdAt: new Date().toISOString(),
    };
    notifications.push(notif);
    return notif;
  },
  getNotifications: (): Notification[] => [...notifications],
};
