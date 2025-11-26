"use client";

import { challengeOptions, challenges } from "@/db/schema";
import React, { useState } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";

/**
 * Quiz Component - Main quiz container that orchestrates the learning experience
 *
 * Features:
 * - Manages user progress, hearts, and challenge completion
 * - Handles challenge navigation and answer selection
 * - Supports both ASSIST (with hints) and SELECT (direct) question types
 * - Integrates with user subscription for premium features
 *
 * @param initialLessonId - ID of the current lesson for persistence
 * @param initialHearts - User's current hearts/lives
 * @param initialPercentage - User's overall progress percentage
 * @param initialLessonChallenges - Array of challenges with options and completion status
 * @param userSubscription - User's subscription data for premium features
 */

// Props interface defining the data structure passed to the Quiz component
type Props = {
  initialLessonId: number;
  initialHearts: number; // User's current hearts/lives
  initialPercentage: number; // User's progress percentage
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[]; // Array of challenges with their options and completion status
  userSubscription: any; // User's subscription info
};

const Quiz = ({
  initialLessonId,
  initialHearts,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  // State management for user progress and game data
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [challenges] = useState(initialLessonChallenges);

  // Smart initial state: finds first incomplete challenge or defaults to first one
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  /**
   * Handles option selection with validation
   * @param id - The ID of the selected challenge option
   */
  const onSelect = (id: number) => {
    if (status !== "none") return; // Prevent multiple selections

    setSelectedOption(id);
  };

  // Get current challenge and its options based on active index
  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  // Dynamic title based on challenge type
  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning" // Instruction for ASSIST type
      : challenge.question; // Direct question for SELECT type

  return (
    <>
      {/* Header shows user progress, hearts, and subscription status */}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      {/* Main quiz content area */}
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            {/* Challenge title/instruction */}
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>

            <div>
              {/* Show question bubble only for ASSIST type challenges */}
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              {/* Main challenge component with options */}
              <Challenge
                options={options}
                onSelect={onSelect} // TODO: Implement selection handler
                status={status} // TODO: Implement status logic
                selectedOption={selectedOption} // TODO: Track selected option
                disabled={false} // TODO: Implement disable logic
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Footer with check button and status feedback */}
      <Footer disabled={!selectedOption} status={status} onCheck={() => {}} />
    </>
  );
};

export default Quiz;
