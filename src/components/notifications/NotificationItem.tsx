import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMarkNotificationAsRead, formatRelativeTime, getNotificationIcon } from "@/hooks/useNotifications";
import type { MemberNotification } from "@/types/database";

interface NotificationItemProps {
    notification: MemberNotification;
    onClose?: () => void;
}

export const NotificationItem = memo(({ notification, onClose }: NotificationItemProps) => {
    const navigate = useNavigate();
    const markAsRead = useMarkNotificationAsRead();

    const handleClick = () => {
        // Mark as read
        if (!notification.is_read) {
            markAsRead.mutate(notification.id);
        }

        // Navigate if action URL exists
        if (notification.action_url) {
            navigate(notification.action_url);
            onClose?.();
        }
    };

    const icon = notification.icon || getNotificationIcon(notification.type);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${notification.is_read
                    ? "bg-transparent hover:bg-muted/30"
                    : "bg-primary/5 hover:bg-primary/10"
                }`}
        >
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${notification.is_read ? "text-foreground" : "text-foreground"
                        }`}>
                        {notification.title}
                    </p>
                    {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                    )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatRelativeTime(notification.created_at)}
                </p>
            </div>
        </motion.div>
    );
});

NotificationItem.displayName = "NotificationItem";
