"use client";

import { courses } from "@/db/schema";
import { Card } from "./card";

type Props = {
    // Array of course objects from the database
  courses: (typeof courses.$inferSelect)[];
  activeCourseId: number;
};

// Main component that displays a list of courses
export const List = ({ courses, activeCourseId }: Props) => {
  return (
    // Container div with responsive grid layout
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc}
          disabled={false}
          active={course.id === activeCourseId}
          onClick={() => {}}
        />
      ))}
    </div>
  );
};
