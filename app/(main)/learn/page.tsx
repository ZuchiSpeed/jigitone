import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import React from "react";
import Header from "./header";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";

// Learn page component - requires active course to be set
const page = async () => {
  // Fetch user progress data
  const userProgressData = getUserProgress();

  const [userProgress] = await Promise.all([userProgressData]);

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
      </FeedWrapper>
    </div>
  );
};

export default page;
