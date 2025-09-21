import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
    return (
      <div className="flex w-full flex-col gap-1">
        {label ? (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}
        <textarea
          id={textareaId}
          className={cn(
            "min-h-[140px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
