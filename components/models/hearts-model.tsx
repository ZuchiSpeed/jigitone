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
import { useHeartsModel } from "@/store/use-hearts-model";

export const HeartsModel = () => {
  // Initialize Next.js router for navigation
  const router = useRouter();

  // State to track if component is running on client side (for SSR compatibility)
  const [isClient, setIsClient] = useState(false);

  // Get modal state and close function from custom store hook
  const { isOpen, close } = useHeartsModel();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => setIsClient(true), []);

  // Don't render anything during server-side rendering
  if (!isClient) return null;

  const onClick = () => {
    close();
    router.push("/store");
  };

  return (
    // Dialog component with open state and change handler
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image
              src="/mascot_bad.svg"
              alt="Sad Mascot"
              width={80}
              height={80}
            />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            You ran out of hearts!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get Pro for unlimited hearts, or purchase them in the store.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            {/* Continue learning button - closes the modal */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onClick}
            >
              Get unlimited Hearts
            </Button>
            {/* Exit button - closes modal and navigates to learn page */}
            <Button
              variant="primaryOutline"
              size="lg"
              className="w-full"
              onClick={close}
            >
              No Thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
