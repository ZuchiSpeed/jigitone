"use client";

import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

const points_to_refill = 10;

// Component that displays shop items and handles interactions
export const Items = ({ hearts, points, hasActiveSubscription }: Props) => {
  // useTransition for pending state during server actions
  const [pending, startTransition] = useTransition();

  // Function to handle heart refill
  const onRefillHearts = () => {
    // Prevent action if:
    // - Already pending
    // - Hearts are already full (5)
    // - Not enough points
    if (pending || hearts === 5 || points < points_to_refill) {
      return;
    }

    // Start server action with transition
    startTransition(() => {
      refillHearts().catch(() => toast.error("Failed to refill hearts"));
    });
  };

  // Function to handle premium upgrade
  const onUpgrade = () => {
    startTransition(() => {
      // Create Stripe checkout session
      createStripeUrl()
        .then((response) => {
          // If successful response with URL, redirect to Stripe
          if (!(response instanceof Error) && response.data) {
            window.location.href = response.data;
          }
        })
        .catch(() => toast.error("Failed to create upgrade session"));
    });
  };

  return (
    <ul className="w-full">
      {/* Heart refill item */}
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/heart.svg" alt="hearts" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Refill Hearts
          </p>
        </div>
        <Button
          onClick={onRefillHearts}
          disabled={pending || hearts === 5 || points < points_to_refill}
        >
          {hearts === 5 ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="points" height={20} width={20} />
              <p>{points_to_refill}</p>
            </div>
          )}
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image src="/unlimited.svg" width={60} height={60} alt="unlimited" />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Unlimited hearts
          </p>
        </div>
        <Button onClick={onUpgrade} disabled={pending}>
          {hasActiveSubscription ? "settings" : "upgrade"}
        </Button>
      </div>
    </ul>
  );
};
