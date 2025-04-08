
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

/**
 * Base service class with common Supabase operations that avoids type inference issues
 * by breaking up chained operations and using proper type assertions
 */
export class DatabaseService<T, TInsert, TTable extends keyof Database['public']['Tables']> {
  protected tableName: TTable;
  protected adapter: (dbData: any) => T;
  
  constructor(tableName: TTable, adapter: (dbData: any) => T) {
    this.tableName = tableName;
    this.adapter = adapter;
  }

  /**
   * Safe single item retrieval with proper error handling
   */
  protected async getSingle(
    id: string,
    selectColumns: string = '*'
  ): Promise<T | null> {
    try {
      // Use type assertion to handle complex typing
      const query = supabase
        .from(this.tableName)
        .select(selectColumns)
        .eq('id' as any, id)
        .limit(1)
        .maybeSingle();
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`[${this.tableName}] getSingle error:`, error);
        throw error;
      }
      
      return data ? this.adapter(data) : null;
    } catch (error) {
      console.error(`[${this.tableName}] getSingle exception:`, error);
      throw error;
    }
  }

  /**
   * Safe multiple items retrieval with proper error handling
   */
  protected async getMultiple(
    selectColumns: string = '*',
    limit: number = 50
  ): Promise<T[]> {
    try {
      const query = supabase
        .from(this.tableName)
        .select(selectColumns)
        .limit(limit);
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`[${this.tableName}] getMultiple error:`, error);
        throw error;
      }
      
      return (data || []).map((item) => this.adapter(item));
    } catch (error) {
      console.error(`[${this.tableName}] getMultiple exception:`, error);
      throw error;
    }
  }

  /**
   * Safe insert with proper error handling and type safety
   */
  protected async insert(
    item: TInsert,
    selectColumns: string = '*'
  ): Promise<T> {
    try {
      // First insert - use type assertion to help TypeScript understand
      const query = supabase
        .from(this.tableName)
        .insert([item as any]);
      
      const { error: insertError } = await query;
      
      if (insertError) {
        console.error(`[${this.tableName}] insert error:`, insertError);
        throw insertError;
      }
      
      // Then retrieve the inserted row
      const id = (item as any).id;
      
      if (!id) {
        throw new Error(`No ID available to retrieve the inserted ${this.tableName}`);
      }
      
      // Fetch the inserted record
      const selectQuery = supabase
        .from(this.tableName)
        .select(selectColumns)
        .eq('id' as any, id)
        .limit(1)
        .maybeSingle();
      
      const { data, error: selectError } = await selectQuery;
      
      if (selectError) {
        console.error(`[${this.tableName}] insert select error:`, selectError);
        throw selectError;
      }
      
      if (!data) {
        throw new Error(`Inserted ${this.tableName} with ID ${id} not found`);
      }
      
      return this.adapter(data);
    } catch (error) {
      console.error(`[${this.tableName}] insert exception:`, error);
      throw error;
    }
  }

  /**
   * Safe update with proper error handling and type safety
   */
  protected async update(
    id: string,
    updates: Partial<TInsert>,
    selectColumns: string = '*'
  ): Promise<T> {
    try {
      // First update
      const updateQuery = supabase
        .from(this.tableName)
        .update(updates as any)
        .eq('id' as any, id);
      
      const { error: updateError } = await updateQuery;
      
      if (updateError) {
        console.error(`[${this.tableName}] update error:`, updateError);
        throw updateError;
      }
      
      // Then fetch the updated record
      const selectQuery = supabase
        .from(this.tableName)
        .select(selectColumns)
        .eq('id' as any, id)
        .limit(1)
        .maybeSingle();
      
      const { data, error: selectError } = await selectQuery;
      
      if (selectError) {
        console.error(`[${this.tableName}] update select error:`, selectError);
        throw selectError;
      }
      
      if (!data) {
        throw new Error(`Updated ${this.tableName} with ID ${id} not found`);
      }
      
      return this.adapter(data);
    } catch (error) {
      console.error(`[${this.tableName}] update exception:`, error);
      throw error;
    }
  }

  /**
   * Safe delete with proper error handling
   */
  protected async delete(id: string): Promise<boolean> {
    try {
      const query = supabase
        .from(this.tableName)
        .delete()
        .eq('id' as any, id);
      
      const { error } = await query;
      
      if (error) {
        console.error(`[${this.tableName}] delete error:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`[${this.tableName}] delete exception:`, error);
      throw error;
    }
  }
}
