import { ResumeSuggestion } from "@/types/tailor";

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface HighlightedResumeProps {
  text: string;
  suggestions: ResumeSuggestion[];
}

export function HighlightedResume({ text, suggestions }: HighlightedResumeProps) {
  const segments: Array<{ content: string; highlight?: ResumeSuggestion }> = [];

  const matches: Array<{ start: number; end: number; suggestion: ResumeSuggestion; matchText: string }> = [];

  suggestions.forEach((suggestion) => {
    const phrase = suggestion.currentPhrase;
    if (!phrase) return;
    const regex = new RegExp(escapeRegExp(phrase), "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        suggestion,
        matchText: match[0],
      });
    }
  });

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  let cursor = 0;
  matches.forEach((match) => {
    if (match.start < cursor) {
      return;
    }
    if (cursor < match.start) {
      segments.push({ content: text.slice(cursor, match.start) });
    }
    segments.push({ content: text.slice(match.start, match.end), highlight: match.suggestion });
    cursor = match.end;
  });

  if (cursor < text.length) {
    segments.push({ content: text.slice(cursor) });
  }

  return (
    <div className="whitespace-pre-wrap rounded-xl border border-brand-100 bg-white/70 p-6 font-mono text-sm leading-relaxed shadow-inner">
      {segments.map((segment, index) =>
        segment.highlight ? (
          <mark
            key={`${segment.content}-${index}`}
            className="rounded bg-brand-100 px-1 py-0.5 text-brand-900"
            title={`${segment.highlight.requirement} — ${segment.highlight.reason}`}
          >
            {segment.content}
          </mark>
        ) : (
          <span key={`text-${index}`}>{segment.content}</span>
        )
      )}
    </div>
  );
}
