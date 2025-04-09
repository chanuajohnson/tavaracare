
import { supabase } from './client';

/**
 * Type-safe query function that prevents excessive type instantiation
 */
export async function queryTable<T>(
  table: string,
  fields: string = '*',
  conditions?: Record<string, any>,
  options?: {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }
): Promise<T[]> {
  try {
    let query = supabase.from(table).select(fields);

    // Apply conditions (where clauses)
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply options
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.orderDirection !== 'desc' 
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error querying ${table}:`, error);
      return [];
    }

    return (data || []) as T[];
  } catch (err) {
    console.error(`Exception querying ${table}:`, err);
    return [];
  }
}

/**
 * Fetches a single record by ID with simplified typing
 */
export async function getById<T>(
  table: string,
  id: string,
  fields: string = '*'
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .eq('id', id)
      .limit(1);

    if (error) {
      console.error(`Error getting ${table} by ID:`, error);
      return null;
    }

    return (data?.[0] as unknown) as T || null;
  } catch (err) {
    console.error(`Exception getting ${table} by ID:`, err);
    return null;
  }
}

/**
 * Get a record by arbitrary column match
 */
export async function getByField<T>(
  table: string,
  field: string,
  value: any,
  fields: string = '*'
): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .eq(field, value);

    if (error) {
      console.error(`Error getting ${table} by ${field}:`, error);
      return [];
    }

    return (data || []) as T[];
  } catch (err) {
    console.error(`Exception getting ${table} by ${field}:`, err);
    return [];
  }
}

/**
 * Inserts records with simplified return type handling
 */
export async function insertRecord<T, U = Partial<T>>(
  table: string,
  data: U,
  options?: {
    returnFields?: string;
  }
): Promise<T | null> {
  try {
    // First insert without select to avoid deep type instantiation
    const { error } = await supabase
      .from(table)
      .insert(data);

    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return null;
    }

    // If we need the inserted record, do a separate query
    if (options?.returnFields) {
      // Get the inserted record by its unique identifiers
      const uniqueFields = Object.entries(data as Record<string, any>)
        .filter(([key]) => ['id', 'uuid', 'user_id', 'session_id'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const result = await queryTable<T>(
        table, 
        options.returnFields, 
        uniqueFields,
        { limit: 1 }
      );
      
      return result[0] || null;
    }

    return (data as unknown) as T;
  } catch (err) {
    console.error(`Exception inserting into ${table}:`, err);
    return null;
  }
}

/**
 * Updates records with simplified return type handling
 */
export async function updateRecord<T>(
  table: string,
  id: string,
  data: Partial<T>,
  options?: {
    returnFields?: string;
  }
): Promise<T | null> {
  try {
    // First update without select to avoid deep type instantiation
    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id);

    if (error) {
      console.error(`Error updating ${table}:`, error);
      return null;
    }

    // If we need the updated record, do a separate query
    if (options?.returnFields) {
      return await getById<T>(table, id, options.returnFields);
    }

    return { id, ...data } as unknown as T;
  } catch (err) {
    console.error(`Exception updating ${table}:`, err);
    return null;
  }
}

/**
 * Deletes a record by ID
 */
export async function deleteRecord(
  table: string,
  id: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Exception deleting from ${table}:`, err);
    return false;
  }
}

/**
 * Paginated query with simplified return types
 */
export async function paginatedQuery<T>(
  table: string,
  fields: string = '*',
  page: number = 1,
  pageSize: number = 10,
  conditions?: Record<string, any>,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc'
): Promise<{
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    // Get total count first
    const countQuery = supabase.from(table).select('id', { count: 'exact' });
    
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        countQuery.eq(key, value);
      });
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error(`Error counting ${table}:`, countError);
      return { data: [], count: 0, totalPages: 0, currentPage: page };
    }
    
    // Then get paginated data
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    
    let query = supabase
      .from(table)
      .select(fields)
      .range(start, end);
    
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        query.eq(key, value);
      });
    }
    
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection !== 'desc' });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error in paginated query for ${table}:`, error);
      return { data: [], count: 0, totalPages: 0, currentPage: page };
    }
    
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      data: (data || []) as T[],
      count: totalCount,
      totalPages,
      currentPage: page
    };
  } catch (err) {
    console.error(`Exception in paginated query for ${table}:`, err);
    return { data: [], count: 0, totalPages: 0, currentPage: page };
  }
}
