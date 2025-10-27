// Import React cache utility for data caching and database instance
import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { courses, units, userProgress } from "@/db/schema";

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

/**
 * Fetches course units with lesson completion status for the current user
 * Uses React cache to memoize results and prevent duplicate API calls
 */
export const getUnits = cache(async () => {
  // Get current user's progress to determine their active course
  const userProgress = await getUserProgress();

  // If user has no active course or progress data, return empty array
  if (!userProgress?.activeCourseId) {
    return [];
  }

  // Query database for all units in the user's active course
  // Include nested relations: lessons -> challenges -> challenge progress
  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        with: {
          challenges: {
            with: {
              challengeProgress: true, // Include progress data for each challenge
            },
          },
        },
      },
    },
  });

  // Transform the data to add completion status to each lesson
  const normalizedData = data.map((unit) => {
    // For each lesson in the unit, calculate if all challenges are completed
    const lessonWithCompletedStatus = unit.lessons.map((lesson) => {
      // Check if every challenge in the lesson is completed
      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress && // Progress data exists
          challenge.challengeProgress.length > 0 && // Has at least one progress record
          challenge.challengeProgress.every((progress) => progress.completed) // All progress records show completed
        );
      });

      // Return lesson object with added completion status
      return { ...lesson, completed: allCompletedChallenges };
    });

    // Return unit with updated lessons array containing completion status
    return { ...unit, lessons: lessonWithCompletedStatus };
  });

  return normalizedData;
});

// Cached query to get specific course by ID
export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  return data;
});
