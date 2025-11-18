import Image from "next/image";
import React from "react";

type Props = {
  question: string; // The question text to display
};

export const QuestionBubble = ({ question }: Props) => {
  return (
    // Container with mascot image and speech bubble
    <div className="flex items-center gap-x-4 mb-6">
      {/* Mascot image - different sizes for responsive design */}
      <Image
        src="/mascot.svg"
        height={60}
        width={60}
        alt="Mascot"
        className="hidden lg:block" // Show only on large screens
      />
      <Image
        src="/mascot.svg"
        height={40}
        width={40}
        alt="Mascot"
        className="block lg:hidden" // Show only on small screens
      />
      {/* Speech bubble with question text */}
      <div className="relative py-2 px-4 border-2 rounded-xl text-sm lg:text-base">
        {question}
        {/* Speech bubble tail/pointer */}
        <div className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90" />
      </div>
    </div>
  );
};
