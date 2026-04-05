"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  stepId: string;
  initialNotes: string;
};

export function StepNotes({ stepId, initialNotes }: Props) {
  const [value, setValue] = useState(initialNotes);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (notes: string) => {
      setStatus("saving");
      const { error } = await supabase
        .from("steps")
        .upsert({ id: stepId, notes, updated_at: new Date().toISOString() });

      if (!error) {
        setStatus("saved");
        savedTimerRef.current = setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("idle");
      }
    },
    [stepId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    timerRef.current = setTimeout(() => {
      save(newValue);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const isEmpty = !value && !focused;

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
        Notes
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Add notes, observations, or changes made during this step..."
        className={`w-full resize-y rounded-lg border border-border px-3 py-2 text-sm text-text-primary bg-white focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-colors ${
          isEmpty ? "min-h-[40px]" : "min-h-[80px]"
        }`}
      />
      <div className="flex justify-end mt-1">
        {status === "saving" && (
          <span className="text-[11px] text-text-muted">Saving...</span>
        )}
        {status === "saved" && (
          <span className="text-[11px] text-green">
            <svg
              className="inline-block w-3 h-3 mr-0.5 -mt-px"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
