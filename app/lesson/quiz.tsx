"use client";

import { challengeOptions, challenges } from "@/db/schema";
import React, { useState, useTransition } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { toast } from "sonner";
import { reduceHearts } from "@/actions/user-progress";

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
  const [pending, startTransition] = useTransition();

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

  /**
   * Advances to the next challenge in the sequence
   */

  const onNext = () => {
    setActiveIndex((next) => next + 1); // Increment active challenge index
  };

  /**
   * Main handler for continuing/checking answers
   * Orchestrates the complete answer validation flow
   */

  const onContinue = () => {
    // Prevent action if no option is selected
    if (!selectedOption) return;

    // Handle UI reset after wrong answer (allow retry)
    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    // Handle moving to next challenge after correct answer
    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    // Find the correct answer from available options
    const correctOption = options.find((option) => option.correct);

    // Step 1: Check if selected answer is correct
    if (correctOption && correctOption.id === selectedOption) {
      // Correct answer flow
      startTransition(() => {
        // Call server action to record progress and award points
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            // Handle case where user has no hearts
            if (response?.error === "hearts") {
              console.log("Missing hearts");
              // TODO: Show UI notification about needing hearts
              return;
            }

            // Update UI state for correct answer
            setStatus("correct");

            // Calculate and update progress percentage
            // Each challenge contributes equally to total progress
            setPercentage((prev) => prev + 100 / challenges.length);

            // Award heart if user completed entire lesson (100% progress)
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, 5));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again"));
      });
    } else {
      // Incorrect answer flow
      startTransition(() => {
        // Call server action to deduct a heart
        reduceHearts(challenge.id)
          .then((response) => {
            // Handle case where user has no hearts
            if (response?.error === "hearts") {
              console.error("Missing Hearts");
              // TODO: Show UI for purchasing hearts or waiting
              return;
            }

            // Show wrong answer UI state
            setStatus("wrong");

            // Only deduct heart if not in practice mode (handled by server)
            if (!response?.error) {
              setHearts((prev) => Math.max(prev - 1, 0)); // Ensure never negative
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again"));
      });
    }
  };

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
                disabled={pending} // TODO: Implement disable logic
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Footer with check button and status feedback */}
      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};

export default Quiz;
