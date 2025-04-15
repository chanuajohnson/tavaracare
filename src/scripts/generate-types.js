
#!/usr/bin/env node

/**
 * This script generates TypeScript types from your Supabase database.
 * 
 * Install the Supabase CLI first: npm install -g supabase
 * 
 * Usage: 
 * 1. Make sure your Supabase project is properly set up in supabase/config.toml
 * 2. Run this script: node generate-types.js
 * 
 * Environment variables:
 * - SUPABASE_PROJECT_ID: Your Supabase project ID (required)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Extract project ID from environment or arguments
const projectId = process.env.SUPABASE_PROJECT_ID || 'cpdfmyemjrefnhddyrck';

if (!projectId) {
  console.error('Error: SUPABASE_PROJECT_ID is required');
  console.error('Usage: SUPABASE_PROJECT_ID=your_project_id node generate-types.js');
  process.exit(1);
}

// File paths
const outputPath = path.join(__dirname, '..', 'types', 'supabase.ts');
const outputDir = path.dirname(outputPath);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  console.log(`Generating types for Supabase project ${projectId}...`);
  
  // Generate types using Supabase CLI
  const command = `npx supabase gen types typescript --project-id ${projectId} --schema public > ${outputPath}`;
  execSync(command, { stdio: 'inherit' });
  
  console.log(`Types generated successfully at: ${outputPath}`);
} catch (error) {
  console.error('Error generating Supabase types:');
  console.error(error.message);
  process.exit(1);
}
