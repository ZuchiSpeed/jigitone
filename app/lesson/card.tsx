import { challenges } from "@/db/schema";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

/**
 * Card Component - Interactive option card for quiz answers
 *
 * Features:
 * - Supports both image and audio content for multimedia questions
 * - Keyboard shortcuts for quick selection
 * - Visual feedback for selection and answer status
 * - Responsive design with conditional layouts for different question types
 * - Accessibility support with proper ARIA patterns
 *
 * @param id - Unique identifier for the option
 * @param imageSrc - Optional image URL for visual questions
 * @param audioSrc - Optional audio URL for listening questions
 * @param text - Display text for the option
 * @param shortcut - Keyboard shortcut key (single character)
 * @param selected - Whether this option is currently selected
 * @param onClick - Click handler function
 * @param status - Visual status ('correct', 'wrong', 'none')
 * @param type - Challenge type affecting layout ('ASSIST' or 'SELECT')
 * @param disabled - Whether the card is interactive
 */

type Props = {
  id: number;
  imageSrc?: string | null; // Optional image for visual questions
  audioSrc?: string | null; // Optional audio for listening questions
  text: string; // Option text
  shortcut: string; // Keyboard shortcut indicator
  selected?: boolean; // Whether this option is currently selected
  onClick: () => void; // Click handler
  status: "correct" | "wrong" | "none"; // Answer status for styling
  type: (typeof challenges.$inferSelect)["type"]; // Challenge type
  disabled?: boolean; // Whether card is interactive
};

export const Card = ({
  id,
  imageSrc,
  audioSrc,
  text,
  shortcut,
  selected,
  onClick,
  status,
  type,
  disabled,
}: Props) => {
  // Audio hook for playing sound when option is selected
  const [audio, _, controls] = useAudio({ src: audioSrc || "" });

  /**
   * Enhanced click handler with audio support
   * Plays audio (if available) and triggers the onClick callback
   */
  const handleClick = useCallback(() => {
    if (disabled) return;

    controls.play();
    onClick();
  }, [disabled, onClick, controls]);

  // Keyboard shortcut support - pressing the shortcut key triggers click
  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    // Interactive card with dynamic styling based on state
    <div
      onClick={handleClick} // TODO: Implement onClick handler
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
        selected &&
          status === "correct" &&
          "border-green-300 bg-green-100 hover:bg-green-100",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100",
        disabled && "pointer-events-none hover:bg-white",
        type === "ASSIST" && "lg:p-3 w-full"
      )}
    >
      {/* Audio element for sound playback */}
      {audio}

      {/* Optional image display */}
      {imageSrc && (
        <div className="relative aspect-square mb-4 w-full max-h-[80px] lg:max-h-[150px]">
          <Image src={imageSrc} fill alt={text} />
        </div>
      )}

      {/* Text and shortcut container */}
      <div
        className={cn(
          "flex items-center justify-between",
          type === "ASSIST" && "flex-row-reverse"
        )}
      >
        {/* Spacer for ASSIST type to balance layout */}
        {type === "ASSIST" && <div />}

        {/* Option text with state-based coloring */}
        <p
          className={cn(
            "text-neutral-600 text-sm lg:text-base",
            selected && "text-sky-500",
            selected && status === "correct" && "text-green-500",
            selected && status === "wrong" && "text-rose-500"
          )}
        >
          {text}
        </p>

        {/* Shortcut indicator with state-based styling */}
        <div
          className={cn(
            "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
            selected && "border-sky-300 text-sky-500",
            selected &&
              status === "correct" &&
              "border-green-500 text-green-500",
            selected && status === "wrong" && "border-rose-500 text-rose-500"
          )}
        >
          {shortcut}
        </div>
      </div>
    </div>
  );
};
