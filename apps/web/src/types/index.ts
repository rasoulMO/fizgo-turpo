// path: /types/index.ts
import { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database";

export * from "./database";
export type TypedSupabaseClient = SupabaseClient<Database>;
