import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Member } from '@/types/database';

export function useMember() {
    const { member: authMember } = useAuth();

    return useQuery({
        queryKey: ['member', authMember?.id],
        queryFn: async (): Promise<Member | null> => {
            if (!authMember?.id) return null;

            const { data, error } = await supabase
                .from('members')
                .select('*')
                .eq('id', authMember.id)
                .single();

            if (error) {
                console.error('Error fetching member:', error);
                return null;
            }

            return data as Member;
        },
        enabled: !!authMember?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Calculate days remaining until expiry
export function useMembershipStatus() {
    const { data: member } = useMember();

    if (!member) {
        return {
            daysLeft: 0,
            isActive: false,
            isExpiringSoon: false,
            status: 'unknown' as const,
        };
    }

    const expiry = member.expiry_date ? new Date(member.expiry_date) : null;
    const today = new Date();
    const daysLeft = expiry
        ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return {
        daysLeft: Math.max(0, daysLeft),
        isActive: member.status === 'active' && daysLeft > 0,
        isExpiringSoon: daysLeft > 0 && daysLeft <= 7,
        status: member.status,
    };
}
