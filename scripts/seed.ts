import "dotenv/config";

// Import all schema definitions from the schema file
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";

// Create a serverless database connection using Neon
const sql = neon(process.env.DATABASE_URL!);
// Initialize Drizzle ORM with the connection and schema
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding database");

    await db.delete(schema.courses);
    await db.delete(schema.userProgress);

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Spanish",
        imageSrc: "/es.svg",
      },
      {
        id: 2,
        title: "Japanese",
        imageSrc: "/jp.svg",
      },
      {
        id: 3,
        title: "French",
        imageSrc: "/fr.svg",
      },
      {
        id: 4,
        title: "Italian",
        imageSrc: "/it.svg",
      },
      {
        id: 5,
        title: "Croatian",
        imageSrc: "/hr.svg",
      },
    ]);

    console.log("Seeding Finished");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to seed the database");
  }
};

main();
