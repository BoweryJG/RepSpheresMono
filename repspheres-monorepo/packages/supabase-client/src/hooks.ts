import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSupabase } from './context';
import { SupabaseError } from './types';

/**
 * Hook for making queries to Supabase
 * 
 * @param queryFn Function that takes a Supabase client and returns a query
 * @param deps Dependencies array that triggers refetch when changed
 * @returns Object containing data, error, loading state, and refetch function
 */
export function useSupabaseQuery<T = any>(
  queryFn: (supabase: ReturnType<typeof useSupabase>['supabase']) => Promise<{ data: T; error: any }> | any,
  deps: any[] = []
) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const query = queryFn(supabase);
      const { data, error } = await (query instanceof Promise ? query : query);

      if (error) {
        throw error;
      }

      setData(data);
      return data;
    } catch (err) {
      const supabaseError: SupabaseError = {
        message: (err as Error).message || 'An error occurred during query',
        status: (err as any).status,
        code: (err as any).code
      };
      setError(supabaseError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, ...deps, queryFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Hook for making mutations to Supabase
 * 
 * @param mutationFn Function that takes a Supabase client and variables and returns a mutation
 * @returns Object containing mutate function, data, error, and loading state
 */
export function useSupabaseMutation<T = any, V = any>(
  mutationFn: (
    supabase: ReturnType<typeof useSupabase>['supabase'],
    variables: V
  ) => Promise<{ data: T; error: any }> | any
) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutate = async (variables: V) => {
    try {
      setIsLoading(true);
      setError(null);

      const mutation = mutationFn(supabase, variables);
      const { data, error } = await (mutation instanceof Promise ? mutation : mutation);

      if (error) {
        throw error;
      }

      setData(data);
      return data;
    } catch (err) {
      const supabaseError: SupabaseError = {
        message: (err as Error).message || 'An error occurred during mutation',
        status: (err as any).status,
        code: (err as any).code
      };
      setError(supabaseError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, error, isLoading };
}

/**
 * Hook for subscribing to realtime changes in Supabase
 * 
 * @param table Table name to subscribe to
 * @param options Options for the subscription
 * @returns Object containing data, error, and channel
 */
export function useSupabaseRealtime<T = any>(
  table: string,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    filter?: string;
  } = { event: '*', schema: 'public' }
) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    try {
      // Create a channel for the table
      const channelName = `${table}-changes`;
      const newChannel = supabase.channel(channelName);
      
      // Add event handler using type assertion to bypass TypeScript error
      // This is a workaround for the TypeScript error with the Supabase API
      (newChannel as any).on('postgres_changes', {
        event: options.event,
        schema: options.schema,
        table,
        filter: options.filter,
      }, (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setData((currentData) => {
          // Handle different event types
          switch (eventType) {
            case 'INSERT':
              return [...currentData, newRecord as T];
            case 'UPDATE':
              return currentData.map((item: any) =>
                item.id === (newRecord as any).id ? (newRecord as T) : item
              );
            case 'DELETE':
              return currentData.filter(
                (item: any) => item.id !== (oldRecord as any).id
              );
            default:
              return currentData;
          }
        });
      });

      // Subscribe to the channel
      newChannel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setChannel(newChannel);
        } else if (status === 'CHANNEL_ERROR') {
          setError({
            message: 'Failed to subscribe to realtime changes',
            code: 'REALTIME_SUBSCRIPTION_ERROR'
          });
        }
      });

      // Cleanup function
      return () => {
        if (newChannel) {
          supabase.removeChannel(newChannel);
        }
      };
    } catch (err) {
      setError({
        message: (err as Error).message || 'Error setting up realtime subscription',
        code: 'REALTIME_SETUP_ERROR'
      });
      return () => {};
    }
  }, [supabase, table, options.event, options.schema, options.filter]);

  return { data, error, channel };
}

/**
 * Hook for handling storage operations in Supabase
 * 
 * @param bucketName Name of the storage bucket
 * @returns Object containing storage operations and state
 */
export function useSupabaseStorage(bucketName: string) {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SupabaseError | null>(null);

  const uploadFile = async (
    path: string,
    file: File,
    options?: { upsert?: boolean; cacheControl?: string }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, options);

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      const storageError: SupabaseError = {
        message: (err as Error).message || 'Error uploading file',
        code: 'STORAGE_UPLOAD_ERROR'
      };
      setError(storageError);
      throw storageError;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(path);

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      const storageError: SupabaseError = {
        message: (err as Error).message || 'Error downloading file',
        code: 'STORAGE_DOWNLOAD_ERROR'
      };
      setError(storageError);
      throw storageError;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      const storageError: SupabaseError = {
        message: (err as Error).message || 'Error removing file',
        code: 'STORAGE_REMOVE_ERROR'
      };
      setError(storageError);
      throw storageError;
    } finally {
      setIsLoading(false);
    }
  };

  const listFiles = async (path?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path || '');

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      const storageError: SupabaseError = {
        message: (err as Error).message || 'Error listing files',
        code: 'STORAGE_LIST_ERROR'
      };
      setError(storageError);
      throw storageError;
    } finally {
      setIsLoading(false);
    }
  };

  const getPublicUrl = (path: string) => {
    return supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
  };

  return {
    uploadFile,
    downloadFile,
    removeFile,
    listFiles,
    getPublicUrl,
    isLoading,
    error,
  };
}

/**
 * Hook for paginated queries in Supabase
 * 
 * @param queryFn Function that takes a Supabase client, page, and pageSize and returns a query
 * @param options Pagination options
 * @returns Object containing pagination state and controls
 */
export function useSupabasePagination<T = any>(
  queryFn: (
    supabase: ReturnType<typeof useSupabase>['supabase'],
    page: number,
    pageSize: number
  ) => Promise<{ data: T[]; error: any; count?: number }>,
  options: { pageSize?: number; initialPage?: number } = {}
) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(options.initialPage || 1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = options.pageSize || 10;

  const fetchPage = useCallback(
    async (pageNumber: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error, count } = await queryFn(supabase, pageNumber, pageSize);

        if (error) {
          throw error;
        }

        setData(data || []);

        if (count !== undefined) {
          setTotalCount(count);
          setTotalPages(Math.ceil(count / pageSize));
        }

        return data;
      } catch (err) {
        const paginationError: SupabaseError = {
          message: (err as Error).message || 'Error fetching page',
          code: 'PAGINATION_ERROR'
        };
        setError(paginationError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, pageSize, queryFn]
  );

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return {
    data,
    error,
    isLoading,
    page,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    refetch: () => fetchPage(page),
  };
}

/**
 * Hook for infinite scrolling queries in Supabase
 * 
 * @param queryFn Function that takes a Supabase client, page, and pageSize and returns a query
 * @param options Infinite query options
 * @returns Object containing infinite query state and controls
 */
export function useSupabaseInfiniteQuery<T = any>(
  queryFn: (
    supabase: ReturnType<typeof useSupabase>['supabase'],
    page: number,
    pageSize: number
  ) => Promise<{ data: T[]; error: any }>,
  options: { pageSize?: number } = {}
) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const pageSize = options.pageSize || 10;
  const currentPage = useRef<number>(1);

  const fetchNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: newData, error } = await queryFn(
        supabase,
        currentPage.current,
        pageSize
      );

      if (error) {
        throw error;
      }

      if (!newData || newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData) => [...prevData, ...newData]);
        currentPage.current += 1;
      }

      return newData;
    } catch (err) {
      const infiniteQueryError: SupabaseError = {
        message: (err as Error).message || 'Error fetching more data',
        code: 'INFINITE_QUERY_ERROR'
      };
      setError(infiniteQueryError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, pageSize, queryFn, isLoading, hasMore]);

  useEffect(() => {
    // Initial fetch
    fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setHasMore(true);
    currentPage.current = 1;
    fetchNextPage();
  }, [fetchNextPage]);

  return {
    data,
    error,
    isLoading,
    hasMore,
    fetchNextPage,
    reset,
  };
}

/**
 * Hook for accessing a specific table in Supabase with common operations
 * 
 * @param tableName Name of the table to access
 * @returns Object containing table operations and state
 */
export function useSupabaseTable<T = any>(tableName: string) {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SupabaseError | null>(null);

  const getAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) {
        throw error;
      }

      return data as T[];
    } catch (err) {
      const tableError: SupabaseError = {
        message: (err as Error).message || `Error fetching all records from ${tableName}`,
        code: 'TABLE_GET_ALL_ERROR'
      };
      setError(tableError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: number | string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as T;
    } catch (err) {
      const tableError: SupabaseError = {
        message: (err as Error).message || `Error fetching record with id ${id} from ${tableName}`,
        code: 'TABLE_GET_BY_ID_ERROR'
      };
      setError(tableError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const insert = async (data: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return insertedData as T;
    } catch (err) {
      const tableError: SupabaseError = {
        message: (err as Error).message || `Error inserting record into ${tableName}`,
        code: 'TABLE_INSERT_ERROR'
      };
      setError(tableError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: number | string, data: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedData as T;
    } catch (err) {
      const tableError: SupabaseError = {
        message: (err as Error).message || `Error updating record with id ${id} in ${tableName}`,
        code: 'TABLE_UPDATE_ERROR'
      };
      setError(tableError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: number | string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      const tableError: SupabaseError = {
        message: (err as Error).message || `Error deleting record with id ${id} from ${tableName}`,
        code: 'TABLE_DELETE_ERROR'
      };
      setError(tableError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAll,
    getById,
    insert,
    update,
    remove,
    isLoading,
    error,
  };
}
