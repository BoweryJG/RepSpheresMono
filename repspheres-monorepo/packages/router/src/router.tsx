import React, { useMemo } from 'react';
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { RouterConfig, AppWithRoutes } from './types';
import { RouterProvider } from './context';
import { normalizePath } from './utils';

// Default not found component
const DefaultNotFound = () => <div>Page not found</div>;

// Auth wrapper component
interface AuthWrapperProps {
  requiresAuth: boolean;
  roles?: string[];
  authComponent: React.ComponentType<any>;
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  requiresAuth,
  roles,
  authComponent: AuthComponent,
  children,
}) => {
  // This is a placeholder for actual auth logic
  // In a real app, you would check if the user is authenticated and has the required roles
  const isAuthenticated = true;
  const userRoles: string[] = ['user', 'admin'];

  const hasRequiredRoles = !roles || roles.some(role => userRoles.includes(role));

  if (requiresAuth && !isAuthenticated) {
    return <AuthComponent />;
  }

  if (requiresAuth && !hasRequiredRoles) {
    return <div>You don't have permission to access this page</div>;
  }

  return <>{children}</>;
};

// App routes component
interface AppRoutesProps {
  app: AppWithRoutes;
  authComponent?: React.ComponentType<any>;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ app, authComponent }) => {
  const AuthComp = authComponent || (() => <div>Authentication required</div>);

  return (
    <Routes>
      {app.routes.map((route) => {
        const { path, component: Component, requiresAuth = false, roles, exact } = route;
        const routePath = normalizePath(path);
        
        return (
          <Route
            key={routePath}
            path={routePath}
            element={
              <AuthWrapper
                requiresAuth={requiresAuth}
                roles={roles}
                authComponent={AuthComp}
              >
                <Component />
              </AuthWrapper>
            }
          />
        );
      })}
    </Routes>
  );
};

// Main router component
interface RepSpheresRouterProps {
  config: RouterConfig;
  children?: React.ReactNode;
}

export const RepSpheresRouter: React.FC<RepSpheresRouterProps> = ({ config, children }) => {
  const {
    apps,
    defaultAppId,
    notFoundComponent,
    authComponent,
    useHashRouter = false,
    baseUrl = '/',
  } = config;

  const RouterComponent = useHashRouter ? HashRouter : BrowserRouter;
  const NotFoundComponent = notFoundComponent || DefaultNotFound;

  // Find the default app
  const defaultApp = useMemo(() => {
    if (defaultAppId) {
      return apps.find((app) => app.id === defaultAppId);
    }
    return apps[0];
  }, [apps, defaultAppId]);

  return (
    <RouterComponent basename={baseUrl}>
      <RouterProvider apps={apps} defaultAppId={defaultAppId}>
        {children}
        <Routes>
          {/* Root redirect to default app */}
          {defaultApp && (
            <Route
              path="/"
              element={<Navigate to={defaultApp.basePath} replace />}
            />
          )}

          {/* App routes */}
          {apps.map((app) => (
            <Route
              key={app.id}
              path={`${app.basePath}/*`}
              element={<AppRoutes app={app} authComponent={authComponent} />}
            />
          ))}

          {/* Not found route */}
          <Route path="*" element={<NotFoundComponent />} />
        </Routes>
      </RouterProvider>
    </RouterComponent>
  );
};

// Layout component with outlet
export const RouterLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Outlet />
    </>
  );
};
