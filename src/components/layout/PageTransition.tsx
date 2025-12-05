import { memo, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Simplified wrapper - no animation delays for instant tab switching
export const PageTransition = memo(({ children }: PageTransitionProps) => {
  return (
    <div className="min-h-screen pb-28">
      {children}
    </div>
  );
});

PageTransition.displayName = "PageTransition";

// Keep for backwards compatibility
export const AnimatedLayout = memo(({ children }: PageTransitionProps) => {
  return <>{children}</>;
});

AnimatedLayout.displayName = "AnimatedLayout";
