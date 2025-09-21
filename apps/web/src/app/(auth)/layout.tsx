import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authenticate | Resume Tailor",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          Resume Tailor
        </Link>
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to home
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl rounded-3xl bg-white/80 p-10 shadow-xl ring-1 ring-brand-100 backdrop-blur">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="hidden flex-col justify-between lg:flex">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                  Proof-first tailoring built for builders.
                </h2>
                <p className="mt-4 text-sm text-slate-600">
                  Map every job requirement to the exact bullet point and proof artifact. Earn trust faster and know exactly
                  what your target company needs to see.
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-6 text-white shadow-lg">
                <p className="text-sm uppercase tracking-widest text-white/80">Verifiable Resume Graph</p>
                <p className="mt-2 text-lg font-semibold">
                  Align your experience to the JD with confidence scores, micro-validations, and exportable proof links.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
