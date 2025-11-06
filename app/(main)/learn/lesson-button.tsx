"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Crown, Star } from "lucide-react";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

type Props = {
  id: number;
  index: number; // Position in the lesson sequence
  totalCount: number; // Total number of lessons
  locked?: boolean; // Whether the lesson is locked/unavailable
  current?: boolean; // Whether this is the current active lesson
  percentage: number; // Progress percentage (0-100)
};

/**
 * LessonButton Component
 * Represents an individual lesson in a visual learning path with progress indication
 * Features a circular progress bar for current lesson and different icons for lesson states
 */
export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
}: Props) => {
  // Pattern cycle for creating a wave-like layout
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  // Calculate horizontal positioning to create a winding path visual
  let indentationLevel;
  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  // Convert indentation level to pixel position
  const rightPosition = indentationLevel * 40;

  // Determine lesson position and state
  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked; // Completed if not current and not locked

  // Dynamic icon based on lesson state
  const Icon = isCompleted ? Check : isLast ? Crown : Star;

  // Navigation destination based on lesson availability
  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }} // Disable interaction for locked lessons
    >
      {/* Container with dynamic positioning for the winding path effect */}
      <div
        className="relative"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        }}
      >
        {/* Current lesson with progress indicator */}
        {current ? (
          <div className="h-[102px] w-[102px] relative">
            <div className="absolute grainy -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-green-500 bg-white rounded-xl animate-bounce tracking-wide z-10">
              Start
              <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2" />
            </div>
            {/* Circular progress bar wrapper for current lesson */}
            <CircularProgressbarWithChildren
              value={Number.isNaN(percentage) ? 0 : percentage}
              styles={{
                path: {
                  stroke: "4ade80",
                },
                trail: {
                  stroke: "e5e7eb",
                },
              }}
            >
              <Button
                size="rounded"
                variant={locked ? "locked" : "secondary"}
                className="h-[70px] w-[70px] border-b-8"
              >
                <Icon
                  className={cn(
                    "h-10 w-10",
                    locked
                      ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                      : "fill-primary-foreground text-primary-foreground",
                    isCompleted && "fill-none stroke-[4]"
                  )}
                />
              </Button>
            </CircularProgressbarWithChildren>
          </div>
        ) : (
          <Button
            size="rounded"
            variant={locked ? "locked" : "secondary"}
            className="h-[70px] w-[70px] border-b-8"
          >
            <Icon
              className={cn(
                "h-10 w-10",
                locked
                  ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                  : "fill-primary-foreground text-primary-foreground",
                isCompleted && "fill-none stroke-[4]"
              )}
            />
          </Button>
        )}
      </div>
    </Link>
  );
};
