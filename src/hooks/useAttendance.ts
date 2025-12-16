import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MemberAttendance } from '@/types/database';

// Fetch attendance for a date range
export function useAttendance(startDate?: Date, endDate?: Date) {
    const { member } = useAuth();

    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return useQuery({
        queryKey: ['attendance', member?.id, startStr, endStr],
        queryFn: async (): Promise<MemberAttendance[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('member_attendance')
                .select('*')
                .eq('member_id', member.id)
                .gte('date', startStr)
                .lte('date', endStr)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching attendance:', error);
                return [];
            }

            return data as MemberAttendance[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Get today's attendance
export function useTodayAttendance() {
    const { member } = useAuth();
    const today = new Date().toISOString().split('T')[0];

    return useQuery({
        queryKey: ['attendance-today', member?.id, today],
        queryFn: async (): Promise<MemberAttendance | null> => {
            if (!member?.id) return null;

            const { data, error } = await supabase
                .from('member_attendance')
                .select('*')
                .eq('member_id', member.id)
                .eq('date', today)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No rows
                console.error('Error fetching today attendance:', error);
                return null;
            }

            return data as MemberAttendance;
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60,
    });
}

// Self check-in
export function useCheckIn() {
    const { member } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!member?.id) throw new Error('Not authenticated');

            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0];

            const { data, error } = await supabase
                .from('member_attendance')
                .insert({
                    member_id: member.id,
                    date: now.toISOString().split('T')[0],
                    check_in_time: timeString,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
        },
    });
}

// Self check-out
export function useCheckOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attendanceId: string) => {
            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0];

            const { error } = await (supabase
                .from('member_attendance') as any)
                .update({ check_out_time: timeString })
                .eq('id', attendanceId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
        },
    });
}

// Calculate attendance stats
export function useAttendanceStats() {
    const { member } = useAuth();
    const { data: attendance, isLoading: queryLoading } = useAttendance();

    // Only show loading if we have a member and the query is actually loading
    const isLoading = !!member?.id && queryLoading;

    if (isLoading || !attendance) {
        return {
            isLoading,
            monthlyCount: 0,
            currentStreak: 0,
            attendanceCalendar: {} as Record<string, boolean>,
        };
    }

    // Build calendar map
    const calendar: Record<string, boolean> = {};
    attendance.forEach((record) => {
        calendar[record.date] = true;
    });

    // Calculate current streak (consecutive days from today backwards)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (calendar[dateStr]) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return {
        isLoading: false,
        monthlyCount: attendance.length,
        currentStreak: streak,
        attendanceCalendar: calendar,
    };
}
