// Import React cache utility for data caching and database instance
import { cache } from "react";
import db from "./drizzle";

// Export a cached function to fetch courses from the database
// cache() wraps the function to memoize results during the same render pass
export const getCourses = cache(async () => {
  // Query the database to find and return all course records
  const data = await db.query.courses.findMany();

  // Return the array of course objects
  return data;
});
