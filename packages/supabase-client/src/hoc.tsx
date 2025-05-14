import type { ComponentType, ReactNode, FC } from 'react';
import { SupabaseProvider } from './context';
import { useSession } from './hooks';

/**
 * Wraps a component with SupabaseProvider.
 */
export function withSupabase<P extends object>(Component: ComponentType<P>): FC<P> {
  const Wrapped: FC<P> = (props) => (
    <SupabaseProvider>
      <Component {...props} />
    </SupabaseProvider>
  );
  return Wrapped;
}

/**
 * Protects component with session check.
 * Wraps in SupabaseProvider and renders fallback if no session.
 */
export function withAuth<P extends object>(Component: ComponentType<P>, fallback: ReactNode = null): FC<P> {
  const Wrapped: FC<P> = (props) => {
    const session = useSession();
    return (
      <SupabaseProvider>
        {session ? <Component {...props} /> : <>{fallback}</>}
      </SupabaseProvider>
    );
  };
  return Wrapped;
}
