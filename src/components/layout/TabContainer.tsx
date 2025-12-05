import React, { memo, useRef, useEffect, Suspense } from "react";
import { useAppNavigation } from "@/contexts/AppNavigationContext";

// Lazy load page components
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Workout = React.lazy(() => import("@/pages/Workout"));
const Diet = React.lazy(() => import("@/pages/Diet"));
const Progress = React.lazy(() => import("@/pages/Progress"));
const Profile = React.lazy(() => import("@/pages/Profile"));

interface TabPanelProps {
  isActive: boolean;
  tabPath: string;
  children: React.ReactNode;
}

const TabPanel = memo(({ isActive, tabPath, children }: TabPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { saveScrollPosition, getScrollPosition } = useAppNavigation();

  // Restore scroll position when tab becomes active
  useEffect(() => {
    if (isActive && containerRef.current) {
      const savedPosition = getScrollPosition(tabPath as any);
      containerRef.current.scrollTop = savedPosition;
    }
  }, [isActive, tabPath, getScrollPosition]);

  // Save scroll position when scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (container) {
            saveScrollPosition(tabPath as any, container.scrollTop);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isActive, tabPath, saveScrollPosition]);

  return (
    <div
      ref={containerRef}
      className="tab-panel scrollbar-hide"
      style={{
        display: isActive ? "block" : "none",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = "TabPanel";

export const TabContainer = memo(() => {
  const { activeTab, isInitialized } = useAppNavigation();

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="tab-container">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <TabPanel isActive={activeTab === "/"} tabPath="/">
          <Dashboard />
        </TabPanel>
        <TabPanel isActive={activeTab === "/workout"} tabPath="/workout">
          <Workout />
        </TabPanel>
        <TabPanel isActive={activeTab === "/diet"} tabPath="/diet">
          <Diet />
        </TabPanel>
        <TabPanel isActive={activeTab === "/progress"} tabPath="/progress">
          <Progress />
        </TabPanel>
        <TabPanel isActive={activeTab === "/profile"} tabPath="/profile">
          <Profile />
        </TabPanel>
      </Suspense>
    </div>
  );
});

TabContainer.displayName = "TabContainer";
