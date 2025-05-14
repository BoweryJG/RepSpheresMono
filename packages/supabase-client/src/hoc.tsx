import React, { ComponentType, ReactNode } from 'react';
import { SupabaseProvider } from './context';
import { useSession } from './hooks';

/**
 * Wraps a component with SupabaseProvider.
 */
export function withSupabase<P>(Component: ComponentType<P>): ComponentType<P> {
  return function SupabaseWrapped(props: P) {
    return (
      <SupabaseProvider>
        <Component {...props} />
      </SupabaseProvider>
    );
  };
}

/**
 * Protects component with session check.
 * Wraps in SupabaseProvider and renders fallback if no session.
 */
export function withAuth<P>(Component: ComponentType<P>, fallback: ReactNode = null): ComponentType<P> {
  return function AuthWrapped(props: P) {
    return (
      <SupabaseProvider>
        <SessionGuard {...props} />
      </SupabaseProvider>
    );
  };

  function SessionGuard(innerProps: P) {
    const session = useSession();
    if (!session) {
      return <>{fallback}</>;
    }
    return <Component {...innerProps} />;
  }
}
