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
    [stepId],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    timerRef.current = setTimeout(() => save(next), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.06em] text-t-muted mb-1.5">
        Notes
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Add notes, observations, or changes made during this step..."
        className="w-full min-h-[80px] resize-y rounded-sm border border-border px-3 py-2 text-sm text-t-primary bg-white placeholder:text-t-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors duration-200"
      />
      <div className="flex justify-end mt-1">
        {status === "saving" && (
          <span className="text-[11px] text-t-muted">Saving...</span>
        )}
        {status === "saved" && (
          <span className="text-[11px] text-success inline-flex items-center gap-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
