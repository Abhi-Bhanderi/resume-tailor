import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appConfig } from "@/lib/utils";
import type { TailorResponse } from "@/types/tailor";

export const runtime = "nodejs";

async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "";
  const name = file.name.toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    const parsed = await pdf(buffer);
    return parsed.text;
  }

  if (mime.includes("word") || mime.includes("officedocument") || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

const confidenceLevels = ["low", "medium", "high"] as const;

function sanitizeSuggestions(data: any, resumeText: string, jobDescription: string): TailorResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response format");
  }

  const suggestions = Array.isArray(data.suggestions)
    ? data.suggestions.map((item: any) => ({
        currentPhrase: String(item.currentPhrase ?? "").trim(),
        suggestedPhrase: String(item.suggestedPhrase ?? "").trim(),
        requirement: String(item.requirement ?? "").trim(),
        reason: String(item.reason ?? "").trim(),
        confidence: ((): (typeof confidenceLevels)[number] => {
          const normalized = String(item.confidence ?? "medium").toLowerCase();
          return confidenceLevels.includes(normalized as (typeof confidenceLevels)[number])
            ? (normalized as (typeof confidenceLevels)[number])
            : "medium";
        })(),
      }))
    : [];

  const summary = data.summary ?? {};

  return {
    resumeText,
    jobDescription,
    suggestions,
    summary: {
      atsAlignmentScore: Math.max(
        0,
        Math.min(1, Number(summary.atsAlignmentScore ?? summary.score ?? 0))
      ),
      keywordCoverage: Array.isArray(summary.keywordCoverage)
        ? summary.keywordCoverage.map((s: any) => String(s))
        : [],
      missingKeywords: Array.isArray(summary.missingKeywords)
        ? summary.missingKeywords.map((s: any) => String(s))
        : [],
    },
  };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const resume = formData.get("resume");
  const jobDescription = String(formData.get("jobDescription") ?? "").trim();

  if (!(resume instanceof File)) {
    return NextResponse.json({ message: "Resume file is required" }, { status: 400 });
  }

  if (!jobDescription) {
    return NextResponse.json({ message: "Job description is required" }, { status: 400 });
  }

  const fileSizeMb = resume.size / (1024 * 1024);
  if (fileSizeMb > appConfig.maxResumeFileSizeMb) {
    return NextResponse.json(
      { message: `Resume file must be under ${appConfig.maxResumeFileSizeMb}MB` },
      { status: 400 }
    );
  }

  let resumeText: string;
  try {
    resumeText = (await extractResumeText(resume)).trim();
  } catch (error) {
    console.error("Failed to parse resume", error);
    return NextResponse.json({ message: "We could not read your resume. Try a different format." }, { status: 400 });
  }

  if (!resumeText) {
    return NextResponse.json({ message: "Could not read resume contents" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ message: "OpenAI API key is not configured" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `You are an expert resume strategist building a Verifiable Resume Graph. \n\nReturn ONLY valid JSON that conforms to this TypeScript type: ${JSON.stringify(
    {
      suggestions: [
        {
          currentPhrase: "string",
          suggestedPhrase: "string",
          requirement: "string",
          reason: "string",
          confidence: "low | medium | high",
        },
      ],
      summary: {
        atsAlignmentScore: 0.0,
        keywordCoverage: ["string"],
        missingKeywords: ["string"],
      },
    },
    null,
    2
  )}\n\nGuidance:\n- Compare the resume against the job description.\n- Highlight specific resume phrases that should be updated to match the job requirements and ATS keywords.\n- For each suggestion, include the requirement that motivates the change and a concise reason.\n- Use confidence to indicate how strongly the change will improve alignment.\n- Provide ATS alignment score between 0 and 1.\n- Populate keywordCoverage with important keywords that are already present in the resume.\n- Populate missingKeywords with the most critical terms not present.\n- Echo back the \"resumeText\" and \"jobDescription\" you analysed.`;

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You analyze resumes and job descriptions to create verifiable tailoring guidance. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: JSON.stringify({
            resumeText,
            jobDescription,
          }),
        },
        { role: "system", content: prompt },
      ],
    });
  } catch (error) {
    console.error("OpenAI request failed", error);
    return NextResponse.json({ message: "AI tailoring service is unavailable. Please try again later." }, { status: 502 });
  }

  const rawContent = completion.choices[0]?.message?.content ?? "";
  const jsonText = rawContent.trim().replace(/^```json\s*|```$/g, "");

  let parsed: TailorResponse;

  try {
    parsed = sanitizeSuggestions(JSON.parse(jsonText), resumeText, jobDescription);
  } catch (error) {
    console.error("Failed to parse OpenAI response", error, jsonText);
    return NextResponse.json({ message: "Failed to parse AI response" }, { status: 502 });
  }

  const analysis = await prisma.resumeAnalysis.create({
    data: {
      userId: session.user.id,
      resumeText,
      jobDescription,
      highlights: parsed,
    },
  });

  return NextResponse.json({
    success: true,
    analysisId: analysis.id,
    data: parsed,
  });
}
