"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { usePracticeModel } from "@/store/use-practice-model";

export const PracticeModel = () => {
  // State to track if component is running on client side (for SSR compatibility)
  const [isClient, setIsClient] = useState(false);

  // Get modal state and close function from custom store hook
  const { isOpen, close } = usePracticeModel();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => setIsClient(true), []);

  // Don't render anything during server-side rendering
  if (!isClient) return null;

  return (
    // Dialog component with open state and change handler
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/heart.svg" alt="Sad Mascot" width={100} height={100} />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            Practice Lesson
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Use practice lessons to regain hearts and points. You cannot loose
            hearts or points in practice mode.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            {/* Exit button - closes modal and navigates to learn page */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={close}
            >
              I Understand
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
