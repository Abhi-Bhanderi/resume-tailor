export interface ResumeSuggestion {
  currentPhrase: string;
  suggestedPhrase: string;
  requirement: string;
  reason: string;
  confidence: "low" | "medium" | "high";
}

export interface TailorSummary {
  atsAlignmentScore: number;
  keywordCoverage: string[];
  missingKeywords: string[];
}

export interface TailorResponse {
  resumeText: string;
  jobDescription: string;
  suggestions: ResumeSuggestion[];
  summary: TailorSummary;
}
