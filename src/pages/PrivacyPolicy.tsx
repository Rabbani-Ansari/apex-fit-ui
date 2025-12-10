import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGymTheme } from '@/hooks/useGymBranding';

const PrivacyPolicy = memo(() => {
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
                        <Shield className="h-5 w-5 text-fitness-orange" />
                        <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
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
                            <h3 className="text-base font-semibold text-fitness-orange">1. Introduction</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Welcome to {gymName}. We are committed to protecting your personal information
                                and your right to privacy. This Privacy Policy explains how we collect, use,
                                disclose, and safeguard your information when you use our mobile application.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">2. Information We Collect</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>Personal identification information (name, email address, phone number)</li>
                                <li>Profile information (profile photo, fitness goals)</li>
                                <li>Health and fitness data (workout logs, body measurements, progress photos)</li>
                                <li>Membership and payment information</li>
                                <li>Device information and usage data</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">3. How We Use Your Information</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Personalize your workout and diet plans</li>
                                <li>Track your fitness progress and achievements</li>
                                <li>Process payments and manage your membership</li>
                                <li>Send you notifications about your workouts and gym updates</li>
                                <li>Respond to your inquiries and provide customer support</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">4. Data Sharing and Disclosure</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We do not sell, trade, or rent your personal information to third parties.
                                We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>With your gym or fitness center for membership management</li>
                                <li>With service providers who assist in our operations</li>
                                <li>When required by law or to protect our rights</li>
                                <li>With your consent for any other purpose</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">5. Data Security</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We implement appropriate technical and organizational security measures to
                                protect your personal information against unauthorized access, alteration,
                                disclosure, or destruction. However, no method of transmission over the
                                Internet is 100% secure.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">6. Your Rights</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>Access and receive a copy of your personal data</li>
                                <li>Rectify or update inaccurate information</li>
                                <li>Request deletion of your personal data</li>
                                <li>Object to or restrict processing of your data</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">7. Data Retention</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We retain your personal information for as long as necessary to fulfill the
                                purposes outlined in this privacy policy, unless a longer retention period
                                is required by law.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">8. Children's Privacy</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Our service is not intended for children under 13 years of age. We do not
                                knowingly collect personal information from children under 13.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">9. Changes to This Policy</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We may update this privacy policy from time to time. We will notify you of
                                any changes by posting the new privacy policy in the app and updating the
                                "Last Updated" date.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-semibold text-fitness-orange">10. Contact Us</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you have any questions about this Privacy Policy or our data practices,
                                please contact us through the app or reach out to your gym management.
                            </p>
                        </section>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
});

PrivacyPolicy.displayName = 'PrivacyPolicy';

export default PrivacyPolicy;
