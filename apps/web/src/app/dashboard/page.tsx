import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ResumeTailorClient } from "@/components/dashboard/resume-tailor";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-16">
      <header className="flex items-center justify-between px-8 py-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">VRG Tailoring Workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">Proof-first tailoring dashboard</h1>
          <p className="text-sm text-slate-600">Logged in as {session.user.email ?? session.user.name ?? "you"}</p>
        </div>
        <SignOutButton />
      </header>
      <div className="mx-auto max-w-6xl px-6">
        <ResumeTailorClient />
      </div>
    </main>
  );
}
