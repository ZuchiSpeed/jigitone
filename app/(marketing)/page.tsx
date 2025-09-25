import { Button } from "@/components/ui/button";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
// import { auth, currentUser } from "@clerk/nextjs/server";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { redirect } from "next/navigation";

export default async function Home() {
  // // Use `auth()` to access `isAuthenticated` - if false, the user is not signed in
  // const { isAuthenticated } = await auth();

  // // Protect the route by checking if the user is signed in
  // if (!isAuthenticated) {
  //   return redirect("/sign-in");
  // }

  // // Get the Backend API User object when you need access to the user's information
  // const user = await currentUser();

  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
      <div className="relative mb-8 w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] lg:mb-0">
        <Image src="/hero.svg" alt="Hero Image" fill />
      </div>
      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-xl font-bold text-center lg:text-3xl text-neutral-600 max-w-[480px]">
          Learn, Practice, and Master new Languages with{" "}
          <strong>JigiTone</strong>
        </h1>
        <div>
          <div className="flex flex-col items-center gap-y-3 w-full max-w-[330px]">
            <ClerkLoading>
              <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignUpButton
                  mode="modal"
                  fallbackRedirectUrl="/learn"
                  signInFallbackRedirectUrl="/learn"
                >
                  <Button size="lg" variant="secondary" className="w-full">
                    Get Started
                  </Button>
                </SignUpButton>

                <SignInButton
                  mode="modal"
                  fallbackRedirectUrl="/learn"
                  signUpFallbackRedirectUrl="/learn"
                >
                  <Button size="lg" variant="primaryOutline" className="w-full">
                    I already have an account
                  </Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  asChild
                >
                  <Link href="/learn">Continue Learning</Link>
                </Button>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>
      </div>
    </div>
  );
}
