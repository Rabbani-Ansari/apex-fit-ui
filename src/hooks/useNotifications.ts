import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MemberNotification } from '@/types/database';

// Fetch all notifications for current member
export function useNotifications() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['notifications', member?.id],
        queryFn: async (): Promise<MemberNotification[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('member_notifications')
                .select('*')
                .eq('member_id', member.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching notifications:', error);
                return [];
            }

            return data as MemberNotification[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// Get count of unread notifications
export function useUnreadNotificationCount() {
    const { data: notifications } = useNotifications();
    return notifications?.filter(n => !n.is_read).length || 0;
}

// Mark a single notification as read
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await (supabase as any)
                .from('member_notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
    const { member } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!member?.id) throw new Error('No member');

            const { error } = await (supabase as any)
                .from('member_notifications')
                .update({ is_read: true })
                .eq('member_id', member.id)
                .eq('is_read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

// Get icon based on notification type
export function getNotificationIcon(type: string): string {
    switch (type) {
        case 'workout': return '💪';
        case 'diet': return '🥗';
        case 'membership': return '💳';
        case 'achievement': return '🏆';
        case 'announcement': return '📢';
        default: return '🔔';
    }
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
