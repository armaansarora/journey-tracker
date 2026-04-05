import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

export type StepRow = {
  id: string;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
  notes: string;
};

export type ActivityLogRow = {
  id: number;
  step_id: string;
  action: "completed" | "uncompleted";
  created_at: string;
};
