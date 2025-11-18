import { challengeOptions, challenges } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Card } from "./card";

// Props for the Challenge component that displays answer options
type Props = {
  options: (typeof challengeOptions.$inferSelect)[];
  onSelect: (id: number) => void; // Callback when user selects an option
  status: "correct" | "wrong" | "none"; // Current answer status
  selectedOption?: number; // Currently selected option ID
  disabled?: boolean; // Whether options are clickable
  type: (typeof challenges.$inferSelect)["type"]; // Challenge type (ASSIST/SELECT)
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
}: Props) => {
  // Dynamic grid layout based on challenge type
  return (
    <div
      className={cn(
        "grid gap-2",
        type === "ASSIST" && "grid-cols-1", // Single column for ASSIST
        type === "SELECT" && // Responsive grid for SELECT
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
      )}
    >
      {/* Render each option as a Card component */}
      {options.map((option, i) => (
        <Card
          key={option.id} // Unique key for React rendering
          id={option.id}
          text={option.text}
          imageSrc={option.imageSrc}
          shortcut={`${i + 1}`} // Keyboard shortcut (1, 2, 3...)
          selected={selectedOption === option.id} // Highlight if selected
          onClick={() => onSelect(option.id)} // Pass selection to parent
          status={status} // Current answer status
          audioSrc={option.audioSrc}
          disabled={disabled} // Disable interaction
          type={type} // Challenge type for styling
        />
      ))}
    </div>
  );
};
