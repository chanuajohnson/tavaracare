
# Tavara Care Application Setup

## Environment Setup Instructions

This application requires Supabase configuration. To set up your local development environment:

1. **Create environment files**:

```bash
# For development
cp .env.development.example .env.development

# For production (if needed locally)
cp .env.production.example .env.production.local
```

2. **Add your Supabase credentials**:

Open the `.env.development` file and add your Supabase URL and Anon Key:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENV=development
```

3. **Database Setup**:

The application uses several database tables. If they don't exist in your Supabase project, you'll need to create them. You can use the SQL scripts in the `supabase/migrations` directory.

## Troubleshooting

### "Missing Supabase credentials" Error

If you see this error:

1. Check that you've copied `.env.development.example` to `.env.development`
2. Verify that the environment variables are correctly set
3. Restart your development server

### "relation does not exist" Error

If you see an error like "relation 'public.chatbot_conversations' does not exist":

1. Run the migration scripts in the `supabase/migrations` directory in your Supabase SQL editor
2. Make sure you have the necessary tables created in your Supabase database

### Stuck on "Loading conversation..."

This typically happens when:
1. The database tables don't exist
2. Supabase credentials are missing or incorrect
3. There's an error in the initialization process

Check the browser console for specific errors and follow the troubleshooting steps above.
