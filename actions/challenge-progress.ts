"use server";

import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Upsert Challenge Progress
 *
 * Handles both creating and updating challenge progress records.
 * Awards points and hearts when a user completes a challenge correctly.
 *
 * @param {number} challengeId - The ID of the challenge being completed
 * @returns {Promise<void | { error: string }>} Returns void on success or error object
 */

export const upsertChallengeProgress = async (challengeId: number) => {
  // Step 1: Authenticate user using Clerk
  const { userId } = await auth();

  // Security check: Ensure user is logged in
  if (!userId) {
    throw new Error("Unauthorized User");
  }

  // Step 2: Fetch current user progress from database
  const currentUserProgress = await getUserProgress();

  // Validate user has existing progress record
  if (!currentUserProgress) {
    throw new Error("User Progress Not Found");
  }

  // Step 3: Fetch the specific challenge details
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  // Validate challenge exists
  if (!challenge) {
    throw new Error("Challenge Not Found");
  }

  // Extract lessonId for cache revalidation later
  const lessonId = challenge.lessonId;

  // Step 4: Check if user already attempted this challenge (practice mode)
  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId), // Match current user
      eq(challengeProgress.challengeId, challengeId) // Match specific challenge
    ),
  });

  // Determine if this is a practice attempt (user already tried before)
  const isPractice = !!existingChallengeProgress;

  // Step 5: Heart management logic
  // Prevent attempt if user has no hearts and it's not practice mode
  if (currentUserProgress.hearts === 0 && !isPractice) {
    return { error: "hearts" }; // Return specific error for UI handling
  }

  // Step 6: Handle practice mode (user retrying a challenge)
  if (isPractice) {
    // Update existing challenge progress record to mark as completed
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    // Award hearts (up to max of 5) and points for practice completion
    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, 5), // Cap hearts at 5
        points: currentUserProgress.points + 10, // Award 10 points
      })
      .where(eq(userProgress.userId, userId));

    // Step 7: Revalidate cached pages to reflect updated progress
    revalidatePath("/learn"); // Learning dashboard
    revalidatePath("/lesson"); // Lesson overview
    revalidatePath("/quests"); // Quests page
    revalidatePath("/leaderboard"); // Leaderboard
    revalidatePath(`/lesson/${lessonId}`); // Specific lesson page
    return; // Exit early since practice mode handled
  }

  // Step 8: Handle first-time completion (not practice mode)
  // Insert new challenge progress record
  await db.insert(challengeProgress).values({
    challengeId, // Which challenge was completed
    userId, // Who completed it
    completed: true, // Mark as completed
  });
};
