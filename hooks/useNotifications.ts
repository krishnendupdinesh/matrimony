"use client";
// hooks/useNotifications.ts — loads live notifications and subscribes to realtime Socket.IO pushes.
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { disconnectSocket, getSocket } from "@/lib/socket";
import type { NotificationItem } from "@/lib/types";

interface NotificationsResponse {
  unreadCount: number;
  notifications: NotificationItem[];
}

// Manages the signed-in member's notification list, unread count, realtime updates, and read actions.
export function useNotifications(enabled: boolean) {
  const [state, setState] = useState<{ items: NotificationItem[]; unreadCount: number }>({
    items: [],
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetches the latest 20 notifications and unread count from the backend.
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<NotificationsResponse>("/api/notifications?page=1&limit=20");
      setState({
        items: Array.isArray(data.notifications) ? data.notifications : [],
        unreadCount: Number(data.unreadCount || 0),
      });
    } catch {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Initial fetch + Socket.IO subscription whenever the member is authenticated.
  useEffect(() => {
    if (!enabled) {
      setState({ items: [], unreadCount: 0 });
      setError("");
      disconnectSocket();
      return;
    }

    fetchNotifications();

    const socket = getSocket();

    // Prepends incoming realtime notifications and increments unreadCount atomically.
    const handleNewNotification = (incoming: NotificationItem) => {
      if (!incoming?.id) return;
      setState((prev) => {
        if (prev.items.some((n) => n.id === incoming.id)) return prev;
        return {
          items: [incoming, ...prev.items].slice(0, 50),
          unreadCount: incoming.readAt ? prev.unreadCount : prev.unreadCount + 1,
        };
      });
    };

    socket.on("notification:new", handleNewNotification);
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [enabled, fetchNotifications]);

  // Marks a single notification as read optimistically and decrements unreadCount atomically.
  const markRead = useCallback(async (id: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const target = prev.items.find((n) => n.id === id);
      if (!target || target.readAt) return prev;
      return {
        items: prev.items.map((n) => (n.id === id ? { ...n, readAt: nowIso } : n)),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      };
    });

    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // Re-sync with server if the request failed.
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Marks all unread notifications as read optimistically and persists on the server.
  const markAllRead = useCallback(async () => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      items: prev.items.map((n) => (n.readAt ? n : { ...n, readAt: nowIso })),
      unreadCount: 0,
    }));

    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return {
    notifications: state.items,
    unreadCount: state.unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
