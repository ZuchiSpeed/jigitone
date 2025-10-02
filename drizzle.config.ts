import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env file
config({ path: ".env" });

// Export Drizzle Kit configuration for database migrations
export default defineConfig({
  schema: "./db/schema.ts",           // Path to database schema definitions
  out: "./drizzle",                   // Output folder for migration files
  dialect: "postgresql",              // Database type (PostgreSQL)
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // Database connection URL from environment variables
  },
});
