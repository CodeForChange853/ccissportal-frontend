import { useEffect, useRef } from 'react';
import { studentApi } from '../features/students/api/studentApi';

const POLL_INTERVAL_MS = 60_000;

export function useNotificationPoller({ onNewNotification } = {}) {
    const lastSeenUnreadCount = useRef(null);

    useEffect(() => {
        let timerId = null;

        async function poll() {
            if (document.hidden) return;

            try {
                const data = await studentApi.fetchNotifications();
                const { notifications, unread_count } = data;

                if (lastSeenUnreadCount.current === null) {
                    lastSeenUnreadCount.current = unread_count;
                    return;
                }

                if (unread_count > lastSeenUnreadCount.current) {
                    const latest = notifications.find(n => !n.is_read);
                    if (latest && onNewNotification) {
                        onNewNotification(latest);
                    }
                }

                lastSeenUnreadCount.current = unread_count;
            } catch {
                // Silent — avoid noise during maintenance windows
            }
        }

        poll();
        timerId = setInterval(poll, POLL_INTERVAL_MS);

        return () => clearInterval(timerId);
    }, [onNewNotification]);
}
