// Vercel serverless entry point — exports the Express app
import app from './src/app.js';
import { seedDemoUser } from './src/services/store.js';

// Runs on cold start; Supabase check prevents duplicate seeding
seedDemoUser().catch(console.error);

export default app;
