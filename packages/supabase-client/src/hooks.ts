import { useSupabaseContext } from './context';

export const useSupabase = () => useSupabaseContext().supabase;
export const useSession = () => useSupabaseContext().session;
