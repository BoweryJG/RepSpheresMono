import { ReactNode } from 'react';

/**
 * Application configuration
 */
export interface AppConfig {
  /** Unique identifier for the application */
  id: string;
  /** Display name of the application */
  name: string;
  /** Base path for the application */
  basePath: string;
  /** Icon component for the application */
  icon?: ReactNode;
  /** Whether the application is enabled */
  enabled?: boolean;
  /** Application-specific configuration */
  config?: Record<string, any>;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  /** Path pattern for the route */
  path: string;
  /** Component to render for the route */
  component: React.ComponentType<any>;
  /** Whether the route is exact */
  exact?: boolean;
  /** Whether the route requires authentication */
  requiresAuth?: boolean;
  /** Roles required to access the route */
  roles?: string[];
  /** Route-specific configuration */
  config?: Record<string, any>;
}

/**
 * Application with routes
 */
export interface AppWithRoutes extends AppConfig {
  /** Routes for the application */
  routes: RouteConfig[];
}

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Applications with routes */
  apps: AppWithRoutes[];
  /** Default application ID to redirect to */
  defaultAppId?: string;
  /** Not found component */
  notFoundComponent?: React.ComponentType<any>;
  /** Authentication component */
  authComponent?: React.ComponentType<any>;
  /** Whether to use hash routing */
  useHashRouter?: boolean;
  /** Base URL for the router */
  baseUrl?: string;
}

/**
 * Navigation item
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display name of the navigation item */
  name: string;
  /** Path for the navigation item */
  path: string;
  /** Icon component for the navigation item */
  icon?: ReactNode;
  /** Whether the navigation item is active */
  active?: boolean;
  /** Whether the navigation item is disabled */
  disabled?: boolean;
  /** Child navigation items */
  children?: NavigationItem[];
}

/**
 * Router context
 */
export interface RouterContextType {
  /** Current application */
  currentApp: AppConfig | null;
  /** Navigate to a path */
  navigateTo: (path: string) => void;
  /** Navigate to an application */
  navigateToApp: (appId: string, path?: string) => void;
  /** Get navigation items */
  getNavigationItems: () => NavigationItem[];
  /** Check if a path is active */
  isActive: (path: string) => boolean;
  /** Get the current path */
  getCurrentPath: () => string;
  /** Get all applications */
  getApps: () => AppConfig[];
}
