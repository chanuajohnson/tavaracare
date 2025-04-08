
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type TableNames = keyof Database['public']['Tables'];

/**
 * Base service class with common Supabase operations that avoids type inference issues
 * by breaking up chained operations and using proper type assertions
 */
export class DatabaseService<T, TInsert, TTable extends TableNames> {
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select(selectColumns)
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select(selectColumns)
        .limit(limit);
      
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
      // First insert
      const { error: insertError } = await supabase
        .from(this.tableName)
        .insert([item]);
      
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
      const { data, error: selectError } = await supabase
        .from(this.tableName)
        .select(selectColumns)
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      
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
      const { error: updateError } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id);
      
      if (updateError) {
        console.error(`[${this.tableName}] update error:`, updateError);
        throw updateError;
      }
      
      // Then fetch the updated record
      const { data, error: selectError } = await supabase
        .from(this.tableName)
        .select(selectColumns)
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      
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
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
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
