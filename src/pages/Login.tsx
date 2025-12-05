import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Dumbbell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { useGymTheme } from '@/hooks/useGymBranding';

const Login = memo(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const { gymName, logoUrl } = useGymTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const result = isSignUp
                ? await signUp(email, password)
                : await signIn(email, password);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isSignUp ? 'Account created! Please check your email.' : 'Welcome back!');
                if (!isSignUp) {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-fitness-orange/20 to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
                <motion.div
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-fitness-purple/20 to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [45, 0, 45],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </div>

            {/* Logo & Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 z-10"
            >
                {logoUrl ? (
                    <img src={logoUrl} alt={gymName} className="h-20 w-20 mx-auto mb-4 rounded-2xl" />
                ) : (
                    <motion.div
                        className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fitness-orange to-fitness-yellow flex items-center justify-center"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <Dumbbell className="h-10 w-10 text-white" />
                    </motion.div>
                )}
                <h1 className="text-3xl font-bold text-foreground">{gymName}</h1>
                <p className="text-muted-foreground mt-1">Member Portal</p>
            </motion.div>

            {/* Login Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-sm z-10"
            >
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fitness-orange/50"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fitness-orange/50"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Confirm Password Input (Sign Up only) */}
                        {isSignUp && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fitness-orange/50"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <AnimatedButton
                            type="submit"
                            variant="gradient"
                            fullWidth
                            size="lg"
                            disabled={isLoading}
                            icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}
                        >
                            {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </AnimatedButton>
                    </form>

                    {/* Toggle Sign Up / Sign In */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {isSignUp ? 'Already have an account?' : "First time here?"}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="ml-1 font-medium text-fitness-orange hover:underline"
                                disabled={isLoading}
                            >
                                {isSignUp ? 'Sign In' : 'Create Account'}
                            </button>
                        </p>
                    </div>

                    {/* Help Text */}
                    <p className="mt-4 text-xs text-center text-muted-foreground">
                        Use the email registered with your gym membership
                    </p>
                </GlassCard>
            </motion.div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-xs text-muted-foreground z-10"
            >
                Powered by FitnessPro
            </motion.p>
        </div>
    );
});

Login.displayName = 'Login';

export default Login;
