import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppConfig, RouterContextType, NavigationItem, AppWithRoutes } from './types';
import { getAppFromPath, getNavigationItemsFromApps } from './utils';

// Create the router context
const RouterContext = createContext<RouterContextType | null>(null);

// Router provider props
interface RouterProviderProps {
  apps: AppWithRoutes[];
  defaultAppId?: string;
  children: React.ReactNode;
}

/**
 * Router provider component
 */
export const RouterProvider: React.FC<RouterProviderProps> = ({
  apps,
  defaultAppId,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentApp, setCurrentApp] = useState<AppConfig | null>(null);

  // Update current app when location changes
  useEffect(() => {
    const app = getAppFromPath(apps, location.pathname);
    setCurrentApp(app);
  }, [apps, location.pathname]);

  // Navigate to a path
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Navigate to an application
  const navigateToApp = (appId: string, path?: string) => {
    const app = apps.find((a) => a.id === appId);
    if (app) {
      navigate(path ? `${app.basePath}${path}` : app.basePath);
    }
  };

  // Get navigation items
  const getNavigationItems = (): NavigationItem[] => {
    return getNavigationItemsFromApps(apps, location.pathname);
  };

  // Check if a path is active
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get the current path
  const getCurrentPath = (): string => {
    return location.pathname;
  };

  // Get all applications
  const getApps = (): AppConfig[] => {
    return apps;
  };

  // Create the context value
  const contextValue = useMemo(
    () => ({
      currentApp,
      navigateTo,
      navigateToApp,
      getNavigationItems,
      isActive,
      getCurrentPath,
      getApps,
    }),
    [currentApp, location.pathname]
  );

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>;
};

/**
 * Hook to use the router context
 */
export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
