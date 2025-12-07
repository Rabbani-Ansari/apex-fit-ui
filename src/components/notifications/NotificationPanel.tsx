import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCheck } from "lucide-react";
import { useNotifications, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationPanel = memo(({ isOpen, onClose }: NotificationPanelProps) => {
    const { data: notifications, isLoading } = useNotifications();
    const markAllAsRead = useMarkAllNotificationsAsRead();

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    const handleMarkAllAsRead = () => {
        markAllAsRead.mutate();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className="fixed top-4 left-4 right-4 z-[90] max-w-md mx-auto overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold text-foreground">Notifications</h2>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleMarkAllAsRead}
                                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                    </motion.button>
                                )}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            ) : notifications && notifications.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {notifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <NotificationItem
                                                notification={notification}
                                                onClose={onClose}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                        <Bell className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-foreground">No notifications</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You're all caught up!
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});

NotificationPanel.displayName = "NotificationPanel";
