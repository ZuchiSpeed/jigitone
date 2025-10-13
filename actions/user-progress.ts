"use server";

import db from "@/db/drizzle";
import { getCourseById, getUserProgress } from "@/db/queries";
import { userProgress } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
