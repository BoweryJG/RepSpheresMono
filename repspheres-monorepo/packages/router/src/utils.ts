import { AppConfig, AppWithRoutes, NavigationItem } from './types';

/**
 * Get the application from a path
 * @param apps - List of applications
 * @param path - Current path
 * @returns The application that matches the path, or null if no match
 */
export const getAppFromPath = (apps: AppWithRoutes[], path: string): AppConfig | null => {
  // Find the app with the longest matching base path
  const matchingApps = apps
    .filter((app) => path.startsWith(app.basePath))
    .sort((a, b) => b.basePath.length - a.basePath.length);

  return matchingApps.length > 0 ? matchingApps[0] : null;
};

/**
 * Get navigation items from applications
 * @param apps - List of applications
 * @param currentPath - Current path
 * @returns List of navigation items
 */
export const getNavigationItemsFromApps = (
  apps: AppWithRoutes[],
  currentPath: string
): NavigationItem[] => {
  return apps
    .filter((app) => app.enabled !== false)
    .map((app) => ({
      id: app.id,
      name: app.name,
      path: app.basePath,
      icon: app.icon,
      active: currentPath.startsWith(app.basePath),
      children: app.routes
        .filter((route) => !route.path.includes(':')) // Filter out dynamic routes
        .map((route) => {
          const path = `${app.basePath}${route.path}`;
          return {
            id: `${app.id}-${route.path}`,
            name: route.path.split('/').pop() || route.path,
            path,
            active: currentPath === path,
          };
        }),
    }));
};

/**
 * Normalize a path by ensuring it starts with a slash and doesn't end with a slash
 * @param path - Path to normalize
 * @returns Normalized path
 */
export const normalizePath = (path: string): string => {
  let normalizedPath = path;
  
  // Ensure path starts with a slash
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Ensure path doesn't end with a slash (unless it's just '/')
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  return normalizedPath;
};

/**
 * Join paths, ensuring there's exactly one slash between them
 * @param paths - Paths to join
 * @returns Joined path
 */
export const joinPaths = (...paths: string[]): string => {
  return paths
    .map((path, i) => {
      // Remove leading slash for all but the first path
      if (i > 0 && path.startsWith('/')) {
        return path.slice(1);
      }
      // Remove trailing slash for all but the last path
      if (i < paths.length - 1 && path.endsWith('/')) {
        return path.slice(0, -1);
      }
      return path;
    })
    .join('/');
};

/**
 * Get the relative path from a full path and a base path
 * @param fullPath - Full path
 * @param basePath - Base path
 * @returns Relative path
 */
export const getRelativePath = (fullPath: string, basePath: string): string => {
  if (fullPath.startsWith(basePath)) {
    const relativePath = fullPath.slice(basePath.length);
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }
  return fullPath;
};
