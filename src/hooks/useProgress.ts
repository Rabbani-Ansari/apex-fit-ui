import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MemberMeasurement, ProgressPhoto, MemberMilestone } from '@/types/database';

// Fetch measurement history
export function useMeasurements(limit = 30) {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['measurements', member?.id, limit],
        queryFn: async (): Promise<MemberMeasurement[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('member_measurements')
                .select('*')
                .eq('member_id', member.id)
                .order('date', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching measurements:', error);
                return [];
            }

            return data as MemberMeasurement[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch progress photos
export function useProgressPhotos() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['progress-photos', member?.id],
        queryFn: async (): Promise<ProgressPhoto[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('progress_photos')
                .select('*')
                .eq('member_id', member.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching progress photos:', error);
                return [];
            }

            return data as ProgressPhoto[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch milestones
export function useMilestones() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['milestones', member?.id],
        queryFn: async (): Promise<MemberMilestone[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('member_milestones')
                .select('*')
                .eq('member_id', member.id)
                .order('achieved', { ascending: false })
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching milestones:', error);
                return [];
            }

            return data as MemberMilestone[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Get weight progression for charts
export function useWeightProgress() {
    const { member } = useAuth();
    const { data: measurements, isLoading: queryLoading } = useMeasurements();

    // Only show loading if we have a member and the query is actually loading
    const isLoading = !!member?.id && queryLoading;

    if (isLoading || !measurements) {
        return {
            isLoading,
            chartData: [],
            latestWeight: null,
            weightChange: 0,
        };
    }

    // Reverse for chronological order
    const sorted = [...measurements].reverse();

    const chartData = sorted.map((m) => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.weight,
    }));

    const latestWeight = measurements[0]?.weight || null;
    const firstWeight = sorted[0]?.weight || null;
    const weightChange = latestWeight && firstWeight
        ? Math.round((firstWeight - latestWeight) * 10) / 10
        : 0;

    return {
        isLoading: false,
        chartData,
        latestWeight,
        weightChange,
    };
}
