import { memo } from "react";
import { motion } from "framer-motion";
import { LottieAnimation } from "@/components/ui/LottieAnimation";

interface ExerciseHeroProps {
    exerciseName: string;
    animationType: string;
    animationUrl?: string | null;
    reps: number;
    weight: number;
}

export const ExerciseHero = memo(({
    exerciseName,
    animationType,
    animationUrl,
    reps,
    weight,
}: ExerciseHeroProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
        >
            {/* Large Animation Container */}
            <div className="relative w-full flex justify-center mb-4">
                <motion.div
                    className="relative rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 backdrop-blur-sm"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />

                    <div className="relative z-10">
                        <LottieAnimation
                            type={animationType}
                            url={animationUrl}
                            size={180}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Exercise Info */}
            <motion.div
                className="text-center space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-2xl font-bold text-foreground">
                    {exerciseName}
                </h2>
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <span className="text-lg">
                        <span className="font-semibold text-foreground">{reps}</span> reps
                    </span>
                    {weight > 0 && (
                        <>
                            <span className="text-muted">•</span>
                            <span className="text-lg">
                                <span className="font-semibold text-foreground">{weight}</span> kg
                            </span>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
});

ExerciseHero.displayName = "ExerciseHero";
