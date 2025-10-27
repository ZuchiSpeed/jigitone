import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import React from "react";
import Header from "./header";
import { UserProgress } from "@/components/user-progress";
import { getUnits, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";

// Learn page component - requires active course to be set
const LearnPage = async () => {
  // Fetch user progress data
  const userProgressData = getUserProgress();
  const unitsData = getUnits();

  const [userProgress, units] = await Promise.all([
    userProgressData,
    unitsData,
  ]);

  // Redirect to courses page if no progress or active course
  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  return (
    <div className="flex flex-row-reverse px-6 gap-[48px]">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            {JSON.stringify(unit)}
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
