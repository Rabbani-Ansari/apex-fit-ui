import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SetProgressDotsProps {
    totalSets: number;
    completedSets: number;
    currentSet: number;
}

export const SetProgressDots = memo(({ totalSets, completedSets, currentSet }: SetProgressDotsProps) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalSets }).map((_, index) => {
                    const setNumber = index + 1;
                    const isCompleted = index < completedSets;
                    const isCurrent = setNumber === currentSet && !isCompleted;
                    const isPending = setNumber > currentSet || (!isCompleted && setNumber > completedSets);

                    return (
                        <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${isCompleted
                                    ? "h-8 w-8 bg-primary text-primary-foreground"
                                    : isCurrent
                                        ? "h-10 w-10 bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "h-8 w-8 bg-muted text-muted-foreground"
                                }`}
                        >
                            {isCompleted ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <span className={`text-xs font-bold ${isCurrent ? "text-primary" : ""}`}>
                                    {setNumber}
                                </span>
                            )}

                            {/* Pulsing animation for current set */}
                            {isCurrent && (
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-primary/30"
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.5, 0, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
            <p className="text-sm text-muted-foreground">
                Set <span className="font-semibold text-foreground">{currentSet}</span> of {totalSets}
            </p>
        </div>
    );
});

SetProgressDots.displayName = "SetProgressDots";
