import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Import all schema definitions from the schema file
import * as schema from "./schema";

// Create a serverless database connection using Neon
const sql = neon(process.env.DATABASE_URL!);
// Initialize Drizzle ORM with the connection and schema
const db = drizzle(sql, { schema });
// Export the database instance for use in other parts of the application
export default db;
