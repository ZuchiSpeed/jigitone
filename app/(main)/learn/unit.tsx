import { lessons, units } from "@/db/schema";
import { UnitBanner } from "./unit-banner";
import { LessonButton } from "./lesson-button";

type Props = {
  id: number; // Unit ID
  order: number; // Unit sequence order
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean; // Lesson data with completion status
  })[];
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect; // Currently active lesson with unit data
      })
    | undefined; // Can be undefined if no active lesson
  activeLessonPercentage: number; // Progress percentage for active lesson (0-100)
};

/**
 * Unit Component
 * Displays a learning unit with banner and a sequence of lesson buttons
 * Handles the visual representation of lessons and their completion states
 */
export const Unit = ({
  id,
  order,
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: Props) => {
  return (
    <>
      {/* Unit header with title and description */}
      <UnitBanner title={title} description={description} />
      {/* Lessons container - flex column to stack lessons vertically */}
      <div className="flex items-center flex-col relative">
        {lessons.map((lesson, index) => {
          // Determine if this lesson is the currently active one
          const isCurrent = lesson.id === activeLesson?.id;
          // Lesson is locked if it's not completed AND not the current lesson
          const isLocked = !lesson.completed && !isCurrent;

          return (
            <LessonButton
              key={lesson.id} // Unique identifier for React rendering
              id={lesson.id} // Lesson ID for navigation
              index={index} // Position in the lessons array
              totalCount={lessons.length - 1} // Total lessons (0-based index)
              current={isCurrent} // Whether this is the active lesson
              locked={isLocked} // Whether the lesson is inaccessible
              percentage={activeLessonPercentage} // Progress for active lesson
            />
          );
        })}
      </div>
    </>
  );
};
