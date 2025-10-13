"use client";

import { courses, userProgress } from "@/db/schema";
import { Card } from "./card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
import { toast } from "sonner";

// Props for the List component - receives courses array and active course ID
type Props = {
  // Array of course objects from the database
  courses: (typeof courses.$inferSelect)[];
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
};

// Main component that displays a list of courses
export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();

  // useTransition for handling pending states during server actions
  const [pending, startTransition] = useTransition();

  // Handle course card click - either navigate to learn or update progress
  const onClick = (id: number) => {
    if (pending) return; // Prevent clicks during pending state

    // If clicking already active course, go to learn page
    if (id === activeCourseId) {
      return router.push("/learn");
    }

    // Otherwise update user progress with selected course
    startTransition(() => {
      upsertUserProgress(id).catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    // Container div with responsive grid layout
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc}
          disabled={pending}
          active={course.id === activeCourseId}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
