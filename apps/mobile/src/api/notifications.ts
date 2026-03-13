import api from './client';

export interface NotificationPreference {
  id: string;
  userId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: { type: string; campaignId?: string; brandId?: string } | null;
  isRead: boolean;
  createdAt: string;
}

interface InboxResponse {
  data: InAppNotification[];
  meta: { nextCursor: string | null; hasMore: boolean };
}

export async function fetchNotifPreferences(): Promise<NotificationPreference> {
  const { data } = await api.get<{ data: NotificationPreference }>('/notifications/preferences');
  return data.data;
}

export async function updateNotifPreferences(
  prefs: { enabled?: boolean },
): Promise<NotificationPreference> {
  const { data } = await api.put<{ data: NotificationPreference }>(
    '/notifications/preferences',
    prefs,
  );
  return data.data;
}

export async function fetchNotificationInbox(cursor?: string): Promise<InboxResponse> {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  const { data } = await api.get<InboxResponse>('/notifications/inbox', { params });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<{ data: { count: number } }>('/notifications/unread-count');
  return data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}
