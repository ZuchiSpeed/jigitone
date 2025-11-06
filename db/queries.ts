// Import React cache utility for data caching and database instance
import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import {
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
} from "@/db/schema";

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
  const { userId } = await auth();

  // Get current user's progress to determine their active course
  const userProgress = await getUserProgress();

  // If user has no active course or progress data, return empty array
  if (!userId || !userProgress?.activeCourseId) {
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
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              }, // Include progress data for each challenge
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
      if (lesson.challenges.length === 0) {
        return {
          ...lesson,
          completed: false,
        };
      }

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

export const getCourseProgress = cache(async () => {
  // Get current authenticated user
  const { userId } = await auth();
  // Fetch user's progress to get active course
  const userProgress = await getUserProgress();

  // Return null if user not authenticated or no active course
  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  // Query all units in the active course with their lessons and challenges
  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)], // Order units by their sequence
    where: eq(units.courseId, userProgress.activeCourseId), // Only units from active course
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)], // Order lessons sequentially
        with: {
          unit: true, // Include unit data
          challenges: {
            with: {
              challengeProgress: {
                // Get progress for current user only
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  /**
   * Find the first uncompleted lesson in the course
   * Strategy: Flatten all lessons from all units, then find the first one that has:
   * - Any challenge without progress data OR
   * - Any challenge with incomplete progress
   */
  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons) // Convert array of units to flat array of lessons
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress || // No progress data exists
          challenge.challengeProgress.length === 0 || // No progress records
          challenge.challengeProgress.some(
            (progress) => progress.completed === false // Some progress is incomplete
          )
        );
      });
    });

  return {
    activeLesson: firstUncompletedLesson, // The lesson user should work on next
    activeLessonId: firstUncompletedLesson?.id || null, // ID for easy reference
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  // Get current course progress to determine active lesson
  const courseProgress = await getCourseProgress();

  // Use provided lesson ID or fall back to active lesson from progress
  const lessonId = id || courseProgress?.activeLessonId;
  if (!lessonId) {
    return null;
  }

  // Fetch lesson data with all challenges and their options
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId), // Specific lesson by ID
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)], // Ordered challenges
        with: {
          challengeOptions: true, // All possible answers/options
          challengeProgress: {
            // User's progress on each challenge
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  /**
   * Normalize challenge data by adding completion status
   * A challenge is considered completed if:
   * - Progress exists AND
   * - There is at least one progress record AND
   * - ALL progress records are marked as completed
   */
  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed }; // Add completion flag to challenge
  });

  return { ...data, challenges: normalizedChallenges }; // Return lesson with enhanced challenges
});

export const getLessonPercentage = cache(async () => {
  // Get current course progress to find active lesson
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0; // No active lesson = 0% progress
  }

  // Fetch the active lesson with normalized challenge data
  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  // Count how many challenges have been completed
  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  // Calculate completion percentage (rounded integer
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});
