"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="gap-2 text-slate-600 hover:text-brand-700"
      disabled={isPending}
      onClick={() => startTransition(async () => signOut({ callbackUrl: "/" }))}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
