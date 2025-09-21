import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm ring-1 ring-brand-200">
          Proof-first resume tailoring
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Tailor your resume with verifiable proof mapped to every job requirement.
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Upload your resume, drop in the job description, and let our AI surface the exact phrases that need to change for ATS alignment—all while keeping track of the evidence you can share.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            Get started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#learn-more"
            className="text-base font-semibold text-brand-700 hover:text-brand-800"
          >
            Learn more about VRG
          </Link>
        </div>
      </div>
    </main>
  );
}
