"use client";

import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export function SocialSignIn() {
  const [isPending, startTransition] = useTransition();

  const handleGoogle = () => {
    startTransition(async () => {
      await signIn("google", { callbackUrl: "/dashboard" });
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full gap-2"
      disabled={isPending}
      onClick={handleGoogle}
    >
      <FcGoogle className="h-5 w-5" />
      {isPending ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}
