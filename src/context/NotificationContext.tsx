import React, { createContext, useContext, useState, useEffect } from "react";
import { NotificationItem } from "../types";
import { StorageService } from "../services/storage";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  sendNotification: (item: Omit<NotificationItem, "id" | "createdAt" | "isRead">) => void;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const refresh = () => {
    if (user) {
      setNotifications(StorageService.getNotifications(user.id));
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
    refresh();
  };

  const sendNotification = (item: Omit<NotificationItem, "id" | "createdAt" | "isRead">) => {
    StorageService.createNotification(item);
    refresh();
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const clearToast = () => setToast(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        sendNotification,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
