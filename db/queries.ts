// Import React cache utility for data caching and database instance
import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { courses, userProgress } from "@/db/schema";

// Export a cached function to fetch courses from the database
// cache() wraps the function to memoize results during the same render pass
export const getCourses = cache(async () => {
  // Query the database to find and return all course records
  const data = await db.query.courses.findMany();

  // Return the array of course objects
  return data;
});

// Cached query to get current user's progress with active course
export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  // Return null if no user is authenticated
  if (!userId) {
    return null;
  }

  // Find user progress and include active course data
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true, // Join with courses table
    },
  });

  return data;
});

// Cached query to get specific course by ID
export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  return data;
});
