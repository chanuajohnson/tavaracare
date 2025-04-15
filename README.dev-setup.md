
# Developer Setup Guide

## Local Environment Setup

To set up your local development environment for this project, follow these steps:

### 1. Configure Environment Variables

This application requires Supabase configuration. The repository includes example files that you should copy and modify:

```bash
# For development
cp .env.development.example .env.development

# For production (if needed locally)
cp .env.production.example .env.production.local
```

**Important:** The `.env.development` and `.env.production.local` files should never be committed to the repository as they may contain sensitive information.

### 2. Supabase Connection

The application connects to Supabase for backend functionality. If you experience connection issues, check:

- Are your environment variables correctly set?
- Is your Supabase project active?
- Does your browser console show any specific errors?

You can access the connection diagnostic page at `/debug/supabase` when running the application.

### 3. GitHub Actions Setup

For CI/CD via GitHub Actions, configure the following repository secrets:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key

These secrets are used by the deployment workflows to build the application correctly.

## Troubleshooting Common Issues

### "supabaseUrl is required" Error

If you see this error:
1. Check that you've copied `.env.development.example` to `.env.development`
2. Verify that the environment variables are correctly set
3. Restart your development server
4. Visit the `/debug/supabase` page to diagnose connection issues

### Authentication Issues

If authentication fails:
1. Check that you're using the correct Supabase project credentials
2. Verify that the Supabase project has authentication enabled
3. Check browser console logs for specific error messages

## Development Guidelines

- Always use the standardized Supabase client from `@/integrations/supabase/client`
- Don't hardcode Supabase URLs or keys in the code
- Use the helper functions like `isDevelopment()` to detect the current environment
