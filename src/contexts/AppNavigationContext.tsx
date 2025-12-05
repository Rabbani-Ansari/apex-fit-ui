import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type TabType = "/" | "/workout" | "/diet" | "/progress" | "/profile";

interface ScrollPositions {
  [key: string]: number;
}

interface AppNavigationContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  scrollPositions: ScrollPositions;
  saveScrollPosition: (tab: TabType, position: number) => void;
  getScrollPosition: (tab: TabType) => number;
  isInitialized: boolean;
}

const AppNavigationContext = createContext<AppNavigationContextType | null>(null);

export const AppNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabType>("/");
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollPositions = useRef<ScrollPositions>({});

  useEffect(() => {
    // Initialize from URL on mount
    const path = window.location.pathname as TabType;
    const validTabs: TabType[] = ["/", "/workout", "/diet", "/progress", "/profile"];
    if (validTabs.includes(path)) {
      setActiveTabState(path);
    }
    setIsInitialized(true);
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    // Update URL without page reload
    window.history.pushState(null, "", tab);
  }, []);

  const saveScrollPosition = useCallback((tab: TabType, position: number) => {
    scrollPositions.current[tab] = position;
  }, []);

  const getScrollPosition = useCallback((tab: TabType) => {
    return scrollPositions.current[tab] || 0;
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as TabType;
      const validTabs: TabType[] = ["/", "/workout", "/diet", "/progress", "/profile"];
      if (validTabs.includes(path)) {
        setActiveTabState(path);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <AppNavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        scrollPositions: scrollPositions.current,
        saveScrollPosition,
        getScrollPosition,
        isInitialized,
      }}
    >
      {children}
    </AppNavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error("useAppNavigation must be used within AppNavigationProvider");
  }
  return context;
};
