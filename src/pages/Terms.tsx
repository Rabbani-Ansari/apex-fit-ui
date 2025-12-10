import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGymTheme } from '@/hooks/useGymBranding';

const Terms = memo(() => {
    const { gymName } = useGymTheme();
    const lastUpdated = 'December 10, 2025';

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
            >
                <div className="flex items-center gap-3 p-4">
                    <Link
                        to="/login"
                        className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-fitness-orange" />
                        <h1 className="text-xl font-bold text-foreground">Terms & Conditions</h1>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 pb-8 max-w-3xl mx-auto"
            >
                <GlassCard className="p-6" hover={false}>
                    <div className="space-y-6 text-foreground">
                        <div className="border-b border-border pb-4">
                            <h2 className="text-lg font-semibold">{gymName}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Last Updated: {lastUpdated}
                            </p>
                        </div>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">1. Acceptance of Terms</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                By accessing or using the {gymName} mobile application, you agree to be bound
                                by these Terms and Conditions. If you do not agree to these terms, please do
                                not use the application.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">2. Account Registration</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                To use certain features of the app, you must register for an account. You agree to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>Provide accurate and complete information during registration</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized use of your account</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">3. Membership and Payment</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your use of the app may be subject to membership fees as determined by your
                                gym or fitness center. Payment terms, refund policies, and membership
                                conditions are governed by your agreement with your gym.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">4. User Conduct</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You agree not to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>Use the app for any unlawful purpose</li>
                                <li>Share your account credentials with others</li>
                                <li>Attempt to gain unauthorized access to other accounts or systems</li>
                                <li>Upload malicious content or interfere with the app's functionality</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">5. Health and Safety Disclaimer</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                The workout plans, diet recommendations, and fitness content provided through
                                this app are for informational purposes only. Before starting any exercise
                                program:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>Consult with a qualified healthcare provider</li>
                                <li>Ensure you are physically capable of performing the exercises</li>
                                <li>Stop immediately if you experience pain, discomfort, or dizziness</li>
                                <li>Follow proper form and technique to avoid injury</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">6. Intellectual Property</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All content, features, and functionality of the app, including but not limited
                                to text, graphics, logos, icons, images, and software, are the exclusive
                                property of {gymName} and its licensors and are protected by intellectual
                                property laws.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">7. Limitation of Liability</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                To the fullest extent permitted by law, {gymName} shall not be liable for any
                                indirect, incidental, special, consequential, or punitive damages arising out
                                of or relating to your use of the app.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">8. Indemnification</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You agree to indemnify and hold harmless {gymName}, its affiliates, and their
                                respective officers, directors, employees, and agents from any claims,
                                damages, losses, or expenses arising from your use of the app or violation
                                of these terms.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">9. Termination</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We reserve the right to suspend or terminate your account at any time for any
                                reason, including violation of these terms. Upon termination, your right to
                                use the app will immediately cease.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">10. Changes to Terms</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We may modify these terms at any time. Continued use of the app after any
                                changes constitutes your acceptance of the new terms. We encourage you to
                                review these terms periodically.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">11. Governing Law</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                These terms shall be governed by and construed in accordance with applicable
                                laws, without regard to conflict of law principles.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">12. Contact Information</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you have any questions about these Terms and Conditions, please contact
                                us through the app or reach out to your gym management.
                            </p>
                        </section>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
});

Terms.displayName = 'Terms';

export default Terms;
