import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface DebugData {
    allWorkoutAssignments: any[];
    allDietAssignments: any[];
    allWorkouts: any[];
    allDietPlans: any[];
    allMembers: any[];
    currentMember: any;
    rlsTestResults: {
        canReadMembers: boolean;
        canReadWorkouts: boolean;
        canReadDietPlans: boolean;
        canReadWorkoutAssignments: boolean;
        canReadDietAssignments: boolean;
        memberAuthIdMatch: boolean;
        errors: string[];
    };
}

export default function DebugPage() {
    const { member, user } = useAuth();
    const [data, setData] = useState<DebugData | null>(null);
    const [loading, setLoading] = useState(true);
    const [fixing, setFixing] = useState(false);
    const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);

    const fetchAllData = async () => {
        setLoading(true);
        const errors: string[] = [];
        const rlsErrors: string[] = [];

        // Get current auth session
        const { data: sessionData } = await supabase.auth.getSession();
        const authUserId = sessionData?.session?.user?.id;
        console.log('🔑 Current auth user ID:', authUserId);

        // Test 1: Try to read workouts (should work - public read policy)
        const { data: allWorkouts, error: e3 } = await supabase
            .from('workouts')
            .select('id, name, body_part')
            .limit(10);
        if (e3) {
            errors.push(`workouts: ${e3.message}`);
            rlsErrors.push(`workouts: ${e3.message}`);
        }
        console.log('📦 All workouts (RLS should allow public read):', allWorkouts);

        // Test 2: Try to read diet_plans (should work - public read policy)
        const { data: allDietPlans, error: e4 } = await supabase
            .from('diet_plans')
            .select('id, name')
            .limit(10);
        if (e4) {
            errors.push(`diet_plans: ${e4.message}`);
            rlsErrors.push(`diet_plans: ${e4.message}`);
        }
        console.log('🍽️ All diet plans (RLS should allow public read):', allDietPlans);

        // Test 3: Try to read members (RLS restricts to own profile)
        const { data: allMembers, error: e5 } = await supabase
            .from('members')
            .select('id, name, email, auth_id')
            .limit(20);
        if (e5) {
            errors.push(`members: ${e5.message}`);
            rlsErrors.push(`members: ${e5.message}`);
        }
        console.log('👥 All members (RLS restricts to own profile):', allMembers);

        // Check if auth_id matches for current member
        const membersArray = allMembers as Array<{ id: string; name: string; email: string; auth_id: string | null }> | null;
        const currentMemberFromDb = membersArray?.find(m => m.email === user?.email);
        const memberAuthIdMatch = currentMemberFromDb?.auth_id === authUserId;
        console.log('🔗 Member auth_id match:', {
            memberEmail: user?.email,
            memberFromDb: currentMemberFromDb,
            authUserId,
            match: memberAuthIdMatch
        });

        // Test 4: Try to read workout_assignments (RLS restricts to member's own)
        const { data: allWorkoutAssignments, error: e1 } = await supabase
            .from('workout_assignments')
            .select('id, member_id, workout_id, status, assigned_at')
            .limit(20);
        if (e1) {
            errors.push(`workout_assignments: ${e1.message}`);
            rlsErrors.push(`workout_assignments: ${e1.message}`);
        }
        console.log('🏋️ All workout assignments (RLS restricts to own):', allWorkoutAssignments);

        // Test 5: Try to read diet_assignments (RLS restricts to member's own)
        const { data: allDietAssignments, error: e2 } = await supabase
            .from('diet_assignments')
            .select('id, member_id, diet_plan_id, status, start_date')
            .limit(20);
        if (e2) {
            errors.push(`diet_assignments: ${e2.message}`);
            rlsErrors.push(`diet_assignments: ${e2.message}`);
        }
        console.log('🥗 All diet assignments (RLS restricts to own):', allDietAssignments);

        setData({
            allWorkoutAssignments: allWorkoutAssignments || [],
            allDietAssignments: allDietAssignments || [],
            allWorkouts: allWorkouts || [],
            allDietPlans: allDietPlans || [],
            allMembers: allMembers || [],
            currentMember: member,
            rlsTestResults: {
                canReadMembers: (allMembers?.length || 0) > 0,
                canReadWorkouts: (allWorkouts?.length || 0) > 0,
                canReadDietPlans: (allDietPlans?.length || 0) > 0,
                canReadWorkoutAssignments: (allWorkoutAssignments?.length || 0) > 0,
                canReadDietAssignments: (allDietAssignments?.length || 0) > 0,
                memberAuthIdMatch,
                errors: rlsErrors,
            },
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, [member, user]);

    // Function to update auth_id in members table
    const fixAuthIdLink = async () => {
        if (!user?.id || !user?.email) {
            setFixResult({ success: false, message: 'No authenticated user found!' });
            return;
        }

        setFixing(true);
        setFixResult(null);

        try {
            // Call the link_auth_to_member RPC function
            // @ts-ignore - RPC function types not generated
            const { data: linkResult, error: linkError } = await supabase.rpc('link_auth_to_member', {
                p_email: user.email,
                p_auth_id: user.id
            });

            if (linkError) {
                // Try direct update as fallback
                const { error: updateError } = await (supabase
                    .from('members') as any)
                    .update({ auth_id: user.id })
                    .eq('email', user.email);

                if (updateError) {
                    throw new Error(`Failed to link auth: ${updateError.message}`);
                }
            }

            setFixResult({ success: true, message: 'Successfully linked auth_id! Refreshing data...' });

            // Refresh data after a short delay
            setTimeout(() => {
                fetchAllData();
                // Force page reload to refresh auth context
                window.location.reload();
            }, 1000);
        } catch (error: any) {
            setFixResult({ success: false, message: error.message });
        } finally {
            setFixing(false);
        }
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-background p-4 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-fitness-orange mx-auto mb-4" />
                        <p className="text-muted-foreground">Running RLS diagnostics...</p>
                    </div>
                </div>
            </PageTransition>
        );
    }

    const rlsTest = data?.rlsTestResults;

    return (
        <PageTransition>
            <div className="min-h-screen bg-background p-4 pb-24">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-foreground">🔍 RLS Debug</h1>
                    <button
                        onClick={fetchAllData}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                    >
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Current Auth State */}
                <GlassCard className="p-4 mb-4">
                    <h2 className="text-lg font-semibold text-fitness-orange mb-2">Current Auth State</h2>
                    <div className="space-y-1 text-sm">
                        <p className="text-foreground">
                            <strong>User Email:</strong> {user?.email || 'Not logged in'}
                        </p>
                        <p className="text-foreground">
                            <strong>Auth User ID:</strong> <code className="bg-muted px-1 rounded text-xs">{user?.id || 'N/A'}</code>
                        </p>
                        <p className="text-foreground">
                            <strong>Member ID:</strong> <code className="bg-muted px-1 rounded text-xs">{member?.id || 'N/A'}</code>
                        </p>
                        <p className="text-foreground">
                            <strong>Member auth_id:</strong> <code className="bg-muted px-1 rounded text-xs">{(member as any)?.auth_id || 'N/A'}</code>
                        </p>
                    </div>
                </GlassCard>

                {/* RLS Test Results */}
                <GlassCard className="p-4 mb-4">
                    <h2 className="text-lg font-semibold text-fitness-purple mb-3">RLS Policy Test Results</h2>
                    <div className="space-y-2">
                        <div className={`flex items-center gap-2 p-2 rounded ${rlsTest?.canReadWorkouts ? 'bg-fitness-success/20' : 'bg-red-500/20'}`}>
                            <span>{rlsTest?.canReadWorkouts ? '✅' : '❌'}</span>
                            <span className="text-sm text-foreground">Can read workouts (public policy): {data?.allWorkouts.length} found</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${rlsTest?.canReadDietPlans ? 'bg-fitness-success/20' : 'bg-red-500/20'}`}>
                            <span>{rlsTest?.canReadDietPlans ? '✅' : '❌'}</span>
                            <span className="text-sm text-foreground">Can read diet_plans (public policy): {data?.allDietPlans.length} found</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${rlsTest?.canReadMembers ? 'bg-fitness-success/20' : 'bg-red-500/20'}`}>
                            <span>{rlsTest?.canReadMembers ? '✅' : '❌'}</span>
                            <span className="text-sm text-foreground">Can read members: {data?.allMembers.length} found</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${rlsTest?.memberAuthIdMatch ? 'bg-fitness-success/20' : 'bg-yellow-500/20'}`}>
                            <span>{rlsTest?.memberAuthIdMatch ? '✅' : '⚠️'}</span>
                            <span className="text-sm text-foreground">
                                Member auth_id matches auth user ID: {rlsTest?.memberAuthIdMatch ? 'Yes' : 'NO - This is likely the issue!'}
                            </span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${rlsTest?.canReadWorkoutAssignments ? 'bg-fitness-success/20' : 'bg-red-500/20'}`}>
                            <span>{rlsTest?.canReadWorkoutAssignments ? '✅' : '❌'}</span>
                            <span className="text-sm text-foreground">Can read workout_assignments: {data?.allWorkoutAssignments.length} found</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${rlsTest?.canReadDietAssignments ? 'bg-fitness-success/20' : 'bg-red-500/20'}`}>
                            <span>{rlsTest?.canReadDietAssignments ? '✅' : '❌'}</span>
                            <span className="text-sm text-foreground">Can read diet_assignments: {data?.allDietAssignments.length} found</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Fix auth_id Link Button */}
                {!rlsTest?.memberAuthIdMatch && (
                    <GlassCard className="p-4 mb-4 border-2 border-yellow-500/50">
                        <h2 className="text-lg font-semibold text-yellow-500 mb-2">⚠️ Auth Link Missing</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            The member's <code>auth_id</code> doesn't match your Supabase auth user ID.
                            This prevents RLS policies from recognizing you as the owner of your data.
                        </p>
                        <AnimatedButton
                            variant="gradient"
                            onClick={fixAuthIdLink}
                            disabled={fixing}
                            icon={fixing ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                        >
                            {fixing ? 'Fixing...' : 'Fix Auth Link'}
                        </AnimatedButton>

                        {fixResult && (
                            <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${fixResult.success ? 'bg-fitness-success/20' : 'bg-red-500/20'}`}>
                                {fixResult.success ? (
                                    <Check className="h-5 w-5 text-fitness-success flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <p className={`text-sm ${fixResult.success ? 'text-fitness-success' : 'text-red-400'}`}>
                                    {fixResult.message}
                                </p>
                            </div>
                        )}
                    </GlassCard>
                )}

                {/* RLS Errors */}
                {rlsTest?.errors && rlsTest.errors.length > 0 && (
                    <GlassCard className="p-4 mb-4 border-2 border-red-500">
                        <h2 className="text-lg font-semibold text-red-500 mb-2">Query Errors</h2>
                        {rlsTest.errors.map((err, i) => (
                            <p key={i} className="text-sm text-red-400">{err}</p>
                        ))}
                    </GlassCard>
                )}

                {/* Data Tables */}
                <GlassCard className="p-4 mb-4">
                    <h2 className="text-lg font-semibold text-fitness-orange mb-2">
                        Workouts ({data?.allWorkouts.length})
                    </h2>
                    {data?.allWorkouts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No workouts found (RLS may be blocking)</p>
                    ) : (
                        <ul className="text-sm text-foreground">
                            {data?.allWorkouts.map((w) => (
                                <li key={w.id} className="mb-1">
                                    <span className="font-mono text-xs">{w.id?.substring(0, 8)}...</span> - {w.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </GlassCard>

                <GlassCard className="p-4 mb-4">
                    <h2 className="text-lg font-semibold text-fitness-purple mb-2">
                        Workout Assignments ({data?.allWorkoutAssignments.length})
                    </h2>
                    {data?.allWorkoutAssignments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assignments found (RLS may be blocking)</p>
                    ) : (
                        <ul className="text-sm text-foreground">
                            {data?.allWorkoutAssignments.map((a) => (
                                <li key={a.id} className="mb-1">
                                    member: <span className="font-mono text-xs">{a.member_id?.substring(0, 8)}...</span> |
                                    workout: <span className="font-mono text-xs">{a.workout_id?.substring(0, 8)}...</span> |
                                    status: {a.status}
                                </li>
                            ))}
                        </ul>
                    )}
                </GlassCard>

                <GlassCard className="p-4 mb-4">
                    <h2 className="text-lg font-semibold text-fitness-orange mb-2">
                        Diet Assignments ({data?.allDietAssignments.length})
                    </h2>
                    {data?.allDietAssignments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assignments found (RLS may be blocking)</p>
                    ) : (
                        <ul className="text-sm text-foreground">
                            {data?.allDietAssignments.map((a) => (
                                <li key={a.id} className="mb-1">
                                    member: <span className="font-mono text-xs">{a.member_id?.substring(0, 8)}...</span> |
                                    diet: <span className="font-mono text-xs">{a.diet_plan_id?.substring(0, 8)}...</span> |
                                    status: {a.status}
                                </li>
                            ))}
                        </ul>
                    )}
                </GlassCard>

                {/* SQL Fix Instructions */}
                <GlassCard className="p-4 mb-4">
                    <h2 className="text-lg font-semibold text-foreground mb-2">Manual SQL Fix</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                        If the button above doesn't work, run this SQL in Supabase:
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto text-foreground">
                        {`-- Update auth_id for member
UPDATE members 
SET auth_id = '${user?.id || 'YOUR_AUTH_USER_ID'}'
WHERE email = '${user?.email || 'YOUR_EMAIL'}';`}
                    </pre>
                </GlassCard>
            </div>
        </PageTransition>
    );
}
