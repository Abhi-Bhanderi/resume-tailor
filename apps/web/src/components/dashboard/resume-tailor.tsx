"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HighlightedResume } from "@/components/dashboard/highlighted-resume";
import type { TailorResponse } from "@/types/tailor";
import { appConfig } from "@/lib/utils";

interface AnalysisState {
  loading: boolean;
  data: TailorResponse | null;
  error: string | null;
}

export function ResumeTailorClient() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [state, setState] = useState<AnalysisState>({ loading: false, data: null, error: null });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
      toast.error("Please upload a PDF, DOCX, or TXT resume file.");
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!resumeFile) {
      toast.error("Please upload your resume file.");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Paste the job description to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);

    setState({ loading: true, data: null, error: null });

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Unable to tailor resume right now.");
      }

      const payload = await response.json();
      setState({ loading: false, data: payload.data, error: null });
      toast.success("Tailoring complete.");
    } catch (error) {
      console.error(error);
      setState({ loading: false, data: null, error: error instanceof Error ? error.message : "Unexpected error" });
      toast.error(error instanceof Error ? error.message : "Unexpected error");
    }
  };

  const atsScore = useMemo(() => {
    if (!state.data) return null;
    return Math.round((state.data.summary.atsAlignmentScore ?? 0) * 100);
  }, [state.data]);

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white/80 p-8 shadow-xl ring-1 ring-brand-100 backdrop-blur-lg"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Upload your resume</h2>
            <p className="text-sm text-slate-600">
              We&apos;ll analyze your resume against the job description and highlight the exact phrases to update for ATS
              alignment.
            </p>
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-6 py-10 text-center transition hover:border-brand-400">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm font-medium text-brand-700">
                {resumeFile ? resumeFile.name : "Drag & drop or click to upload"}
              </span>
              <span className="mt-2 text-xs text-slate-500">
                PDF, DOCX, or TXT up to {appConfig.maxResumeFileSizeMb}MB
              </span>
            </label>
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Paste the job description</h2>
            <Textarea
              label="Job description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the most important requirements and responsibilities here."
              rows={12}
              helperText="We use this to map requirements to resume bullets."
            />
            <Button type="submit" className="w-full" disabled={state.loading}>
              {state.loading ? "Analyzing with AI..." : "Generate tailored highlights"}
            </Button>
          </div>
        </div>
      </form>

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{state.error}</div>
      ) : null}

      {state.data ? (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Recommended updates</h3>
                {atsScore !== null ? (
                  <div className="flex items-center gap-3 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                    ATS match score
                    <span className="text-lg font-bold text-brand-800">{atsScore}%</span>
                  </div>
                ) : null}
              </div>
              <div className="space-y-3">
                {state.data.suggestions.length === 0 ? (
                  <p className="text-sm text-slate-600">Great news — your resume already mirrors this job description.</p>
                ) : (
                  state.data.suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.currentPhrase}-${index}`}
                      className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                          Requirement match
                        </div>
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                          Confidence: {suggestion.confidence}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-900">{suggestion.requirement}</p>
                      <p className="mt-2 text-sm text-slate-600">{suggestion.reason}</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Current phrasing</p>
                          <p className="mt-2 text-slate-700">{suggestion.currentPhrase}</p>
                        </div>
                        <div className="rounded-xl bg-brand-50 p-4 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Suggested update</p>
                          <p className="mt-2 text-brand-800">{suggestion.suggestedPhrase}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <aside className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Keyword coverage</h4>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Present</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.data.summary.keywordCoverage.length ? (
                    state.data.summary.keywordCoverage.map((keyword) => (
                      <span
                        key={`covered-${keyword}`}
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No overlaps detected yet.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Missing</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.data.summary.missingKeywords.length ? (
                    state.data.summary.missingKeywords.map((keyword) => (
                      <span
                        key={`missing-${keyword}`}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No major gaps detected.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Your resume with highlights</h3>
            <HighlightedResume text={state.data.resumeText} suggestions={state.data.suggestions} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
