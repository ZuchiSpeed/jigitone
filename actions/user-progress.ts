"use server";

import db from "@/db/drizzle";
import { getCourseById, getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const points_to_refill = 10;

// Server action to create or update user progress when selecting a course
export const upsertUserProgress = async (courseId: number) => {
  // Get authenticated user ID and user object from Clerk
  const { userId } = await auth();
  const user = await currentUser();

  // Check if user is authenticated
  if (!userId || !user) {
    throw new Error("Unauthorized User");
  }

  // Verify the selected course exists
  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not Found");
  }

  //   if(!course.units.length || !course.units[0].lessons.length) {
  //     throw new Error("Course Is Empty")
  //   }

  // Check if user already has progress record
  const existingUserProgress = await getUserProgress();

  // If progress exists, update the active course
  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    });

    // Refresh cached data and redirect to learning page
    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  // If no progress exists, create new progress record
  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImageSrc: user.imageUrl || "/mascot.svg",
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

/**
 * Server Action: Reduce User Hearts
 *
 * Deducts a heart when a user answers incorrectly on their first attempt.
 * Prevents heart reduction during practice mode.
 *
 * @param {number} challengeId - The ID of the challenge failed
 * @returns {Promise<void | { error: string }>} Returns void or error object
 */

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthrized User");
  }

  const currentUserProgress = await getUserProgress();
  //TODO: get user subscription

  //Fetch challenge details
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge Not Found");
  }

  const lessonId = challenge.lessonId;

  //  Check if this is practice mode (already attempted)
  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;

  // Prevent heart reduction in practice mode
  if (isPractice) {
    return { error: "practice" };
  }

  // Validate user progress exists
  if (!currentUserProgress) {
    throw new Error("User Progress Not Found");
  }

  // Step 6: Check if user has hearts to lose
  // TODO: handle subscription (premium users might not lose hearts)
  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User Progress Not Found");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already Full");
  }

  if (currentUserProgress.points < points_to_refill) {
    throw new Error("Not Enough Points");
  }

  await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: currentUserProgress.points - points_to_refill,
    })
    .where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
