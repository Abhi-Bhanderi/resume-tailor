import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <LoginForm />
      <div className="relative flex items-center gap-4 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or continue with
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <SocialSignIn />
    </div>
  );
}
