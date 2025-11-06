import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import React from "react";
import Header from "./header";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
} from "@/db/queries";
import { redirect } from "next/navigation";
import { Unit } from "./unit";

/**
 * Learn Page - Main learning interface where users can progress through course units
 * Requires an active course to be set for the user
 */
const LearnPage = async () => {
  // Fetch user progress data
  // Fetch all required data in parallel for better performance
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();

  // Wait for all data fetching promises to resolve
  const [userProgress, units, courseProgress, lessonPercentage] =
    await Promise.all([
      userProgressData,
      unitsData,
      courseProgressData,
      lessonPercentageData,
    ]);

  // Redirect to courses page if no progress or active course
  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  // Redirect if no course progress is found
  if (!courseProgress) {
    redirect("/courses");
  }

  return (
    <div className="flex flex-row-reverse px-6 gap-[48px]">
      {/* Sticky sidebar with user progress information */}
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      {/* Main content feed with course units */}
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {/* Render each unit in the course */}
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
