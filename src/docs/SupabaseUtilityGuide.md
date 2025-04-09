# Supabase Utility Documentation

This document provides an overview of the Supabase utility layer implemented to solve TypeScript excessive type instantiation issues while maintaining type safety.

## Background

Supabase client's TypeScript types create deeply nested type instantiations when chaining query methods, especially with complex database schemas. This can cause TypeScript compiler errors (TS2589: Type instantiation is excessively deep and possibly infinite) and slow down IDE performance.

## Solution

We've implemented a utility layer that simplifies type inference while maintaining type safety:

### Directory Structure

```
src/utils/supabase/
├── types.ts - Simplified versions of Supabase response types
├── client.ts - Wrapper around Supabase client with utilities
└── query-helpers.ts - Type-safe utility functions for common operations
```

## How to Use

### Import Required Utilities

```typescript
import { 
  queryTable, 
  getById, 
  insertRecord, 
  updateRecord,
  deleteRecord,
  paginatedQuery
} from '@/utils/supabase/query-helpers';
import { YourTableType } from '@/utils/supabase/types';
```

### Query Data

```typescript
// Get data with conditions
const users = await queryTable<UserRow>(
  'users',                          // table name
  'id, name, email',                // fields to select
  { is_active: true },              // conditions
  { limit: 10, orderBy: 'created_at', orderDirection: 'desc' } // options
);

// Get by ID
const user = await getById<UserRow>('users', userId, 'id, name, email');

// Filter by field
const activeUsers = await getByField<UserRow>('users', 'status', 'active');
```

### Insert Data

```typescript
const newUser = await insertRecord<UserRow>(
  'users',  
  { name: 'John Doe', email: 'john@example.com' },
  { returnFields: 'id, name, email' } // optional
);
```

### Update Data

```typescript
const updatedUser = await updateRecord<UserRow>(
  'users',
  userId,
  { name: 'Updated Name' },
  { returnFields: 'id, name, email' } // optional
);
```

### Delete Data

```typescript
const success = await deleteRecord('users', userId);
```

### Paginated Queries

```typescript
const { 
  data,        // Array of results
  count,       // Total count of matching records
  totalPages,  // Total number of pages
  currentPage  // Current page number
} = await paginatedQuery<UserRow>(
  'users',       // table name
  '*',           // fields to select
  1,             // page
  10,            // page size
  { is_active: true }, // conditions
  'created_at',  // order by
  'desc'         // order direction
);
```

## Type Safety

Define your row types in `src/utils/supabase/types.ts` to ensure type safety:

```typescript
export interface UserRow extends BaseRecord {
  name: string;
  email: string;
  role: string;
  // other fields
}
```

## Migration Guide

When refactoring existing Supabase queries:

1. Import the appropriate utility functions
2. Define row type interfaces in types.ts
3. Replace direct Supabase queries with utility functions
4. Remove explicit typing from query chains
5. Test the refactored code

## Benefits

- No more TS2589 errors
- Improved IDE performance
- More maintainable and readable database code
- Consistent error handling
- Simplified query patterns
