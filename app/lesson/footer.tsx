import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { useKey, useMedia } from "react-use";

/**
 * Footer Component - Interactive footer for quiz navigation and feedback
 *
 * Features:
 * - Dynamic status feedback (correct/wrong/completed)
 * - Keyboard support (Enter key to check answers)
 * - Responsive design for mobile and desktop
 * - Adaptive button text and styling based on quiz state
 *
 * @param onCheck - Callback function when check button is clicked
 * @param status - Current answer status ('correct', 'wrong', 'none', 'completed')
 * @param disabled - Whether the check button is disabled
 * @param lessonId - Lesson ID for navigation when practice is completed
 */

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  //Chnaged lesson id to include a value
  lessonId?: number;
};

export const Footer = ({ onCheck, status, disabled, lessonId }: Props) => {
  // Responsive design hook for mobile detection
  const isMobile = useMedia("(max-width: 1024px");
  // Keyboard shortcut: Enter key triggers onCheck
  useKey("Enter", onCheck, {}, [onCheck]);

  return (
    <footer
      className={cn(
        "lg:-h[140px] h-[100px] border-t-2",
        // Dynamic background colors based on answer status
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">
        {/* Success feedback with check icon */}
        {status === "correct" && (
          <div className="text-green-500 font-bold lg:text-2xl text-base flex items-center">
            <CheckCircle className="h-6 w-6 mr-4 lg:h-10 lg:w-10" />
            Nicely Done!
          </div>
        )}

        {/* Error feedback with X icon */}
        {status === "wrong" && (
          <div className="text-rose-500 font-bold lg:text-2xl text-base flex items-center">
            <XCircle className="h-6 w-6 mr-4 lg:h-10 lg:w-10" />
            Wrong Try Again!
          </div>
        )}
        {/* Completion state with practice button */}
        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() => (window.location.href = `/lesson/${lessonId}`)}
          >
            Practice Again
          </Button>
        )}

        {/* Main action button with dynamic text and styling */}
        <Button
          disabled={disabled}
          onClick={onCheck}
          className="ml-auto"
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Next"}
          {status === "wrong" && "Retry"}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  );
};
