import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRouter } from './context';
import { getRelativePath } from './utils';

/**
 * Hook to use the current application
 * @returns The current application
 */
export const useCurrentApp = () => {
  const { currentApp } = useRouter();
  return currentApp;
};

/**
 * Hook to use navigation
 * @returns Navigation functions
 */
export const useNavigation = () => {
  const { navigateTo, navigateToApp } = useRouter();
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  return {
    navigateTo,
    navigateToApp,
    goBack,
    goForward,
    navigate,
  };
};

/**
 * Hook to use the current path
 * @returns The current path and related functions
 */
export const usePath = () => {
  const location = useLocation();
  const { currentApp, isActive } = useRouter();

  const currentPath = location.pathname;
  
  const relativePath = useMemo(() => {
    if (currentApp) {
      return getRelativePath(currentPath, currentApp.basePath);
    }
    return currentPath;
  }, [currentPath, currentApp]);

  return {
    currentPath,
    relativePath,
    isActive,
    search: location.search,
    hash: location.hash,
    state: location.state,
  };
};

/**
 * Hook to use route parameters
 * @returns Route parameters
 */
export const useRouteParams = <T extends Record<string, string>>() => {
  return useParams<T>();
};

/**
 * Hook to use navigation items
 * @returns Navigation items and related functions
 */
export const useNavigationItems = () => {
  const { getNavigationItems, getApps } = useRouter();
  const location = useLocation();

  const navigationItems = useMemo(() => getNavigationItems(), [getNavigationItems, location.pathname]);
  const apps = useMemo(() => getApps(), [getApps]);

  return {
    navigationItems,
    apps,
  };
};

/**
 * Hook to use query parameters
 * @returns Query parameters and related functions
 */
export const useQueryParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const params: Record<string, string> = {};
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }, [location.search]);

  const setQueryParam = useCallback(
    (key: string, value: string | null) => {
      const searchParams = new URLSearchParams(location.search);
      
      if (value === null) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
      
      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
    },
    [location.pathname, location.search, navigate]
  );

  const getQueryParam = useCallback(
    (key: string) => {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get(key);
    },
    [location.search]
  );

  return {
    queryParams,
    setQueryParam,
    getQueryParam,
  };
};
