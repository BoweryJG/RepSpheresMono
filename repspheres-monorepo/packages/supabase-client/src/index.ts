// Export client functions
export { createSupabaseClient, getSupabaseClient, initializeSupabase, resetSupabaseClient } from './client';

// Export context and hooks
export { 
  SupabaseProvider, 
  useSupabase, 
  useSupabaseAuth,
  useSupabaseProfile
} from './context';

// Export hooks
export {
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseRealtime,
  useSupabaseTable,
  useSupabaseStorage,
  useSupabasePagination,
  useSupabaseInfiniteQuery
} from './hooks';

// Export HOCs
export { withSupabase, withSupabaseAuth } from './hoc';
export type { WithSupabaseProps, WithSupabaseAuthProps } from './hoc';

// Export types
export * from './types';
