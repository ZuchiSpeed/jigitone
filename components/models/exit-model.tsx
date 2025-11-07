"use client";

import { useExitModel } from "@/store/use-exit-model";
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

export const ExitModel = () => {
  // Initialize Next.js router for navigation
  const router = useRouter();

  // State to track if component is running on client side (for SSR compatibility)
  const [isClient, setIsClient] = useState(false);

  // Get modal state and close function from custom store hook
  const { isOpen, close } = useExitModel();

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
            <Image
              src="/mascot_sad.svg"
              alt="Sad Mascot"
              width={80}
              height={80}
            />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            Wait, don&apos;t go!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You&apos;re about to leave the lesson. Are you sure you want to
            exit?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            {/* Continue learning button - closes the modal */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={close}
            >
              Keep Learning
            </Button>
            {/* Exit button - closes modal and navigates to learn page */}
            <Button
              variant="dangerOutline"
              size="lg"
              className="w-full"
              onClick={() => {
                close();
                router.push("/learn");
              }}
            >
              End Session
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
