import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyEmailToken } from "@/server/services/auth";

interface VerifyPageProps {
  params: { token: string };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const result = await verifyEmailToken(params.token);

  if (result.success) {
    redirect("/login?verified=1");
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Unable to verify email</h1>
      <p className="text-sm text-slate-600">{result.message}</p>
      <Link href="/register" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        Go back to sign up
      </Link>
    </div>
  );
}
