import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getMemberByEmail } from '@/lib/supabase';
import type { Member } from '@/types/database';

interface AuthContextType {
    user: User | null;
    member: Member | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [member, setMember] = useState<Member | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch member profile by email - separate from auth state change
    const fetchMemberProfile = async (email: string): Promise<Member | null> => {
        try {
            const memberData = await getMemberByEmail(email);
            return memberData;
        } catch (error) {
            console.error('Error fetching member profile:', error);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        // Set up auth state listener FIRST (no async operations inside!)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) return;
                
                // Only synchronous state updates here
                setSession(session);
                setUser(session?.user ?? null);
                
                // Defer member fetch with setTimeout to avoid deadlock
                if (session?.user?.email) {
                    setTimeout(() => {
                        if (isMounted) {
                            fetchMemberProfile(session.user.email!).then(memberData => {
                                if (isMounted) {
                                    setMember(memberData);
                                    setIsLoading(false);
                                }
                            });
                        }
                    }, 0);
                } else {
                    setMember(null);
                    setIsLoading(false);
                }
            }
        );

        // THEN check for existing session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;
            
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user?.email) {
                const memberData = await fetchMemberProfile(session.user.email);
                if (isMounted) {
                    setMember(memberData);
                }
            }
            
            if (isMounted) {
                setIsLoading(false);
            }
        }).catch(() => {
            if (isMounted) {
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        // First, validate that this email exists in members table
        const memberExists = await getMemberByEmail(email);

        if (!memberExists) {
            return { error: 'No gym membership found for this email. Please contact your gym.' };
        }

        // Proceed with Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }

        // Set member data immediately
        if (data.user) {
            setMember(memberExists);
        }

        return { error: null };
    };

    const signUp = async (email: string, password: string) => {
        // First, validate that this email exists in members table
        const memberExists = await getMemberByEmail(email);

        if (!memberExists) {
            return { error: 'No gym membership found for this email. Please contact your gym to register.' };
        }

        // Create auth account with redirect URL
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl
            }
        });

        if (error) {
            return { error: error.message };
        }

        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setMember(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            member,
            session,
            isLoading,
            signIn,
            signUp,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

