import React, { ComponentType, ReactNode } from 'react';
import { useSession } from './hooks';

/**
 * Wraps component with Supabase context.
 */
export function withSupabase<P>(Component: ComponentType<P>): ComponentType<P> {
  return function SupabaseWrapped(props: P) {
    return React.createElement(Component as React.ComponentType<any>, props as any);
  };
}

/**
 * Protects component with session check, renders fallback if no session.
 */
export function withAuth<P>(Component: ComponentType<P>, fallback: ReactNode = null): ComponentType<P> {
  return function AuthWrapped(props: P) {
    const session = useSession();
    if (!session) {
      return React.createElement(React.Fragment, null, fallback);
    }
    return React.createElement(Component as React.ComponentType<any>, props as any);
  };
}
