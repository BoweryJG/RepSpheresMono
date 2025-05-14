import React, { FC, useEffect, useState } from 'react';
import { withSupabase, useSupabase, useSession } from '@repspheres/supabase-client';
import type { Session } from '@supabase/supabase-js';

const SupabaseExample: FC = () => {
  const supabase = useSupabase();
  const session = useSession();
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('profiles').select('id, name');
        if (error) throw error;
        setProfiles(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [supabase]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Profiles Example</h1>
      {session ? <p>Logged in as: {session.user.email}</p> : <p>No active session</p>}
      {loading && <p>Loading profiles...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {profiles.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default withSupabase(SupabaseExample);
