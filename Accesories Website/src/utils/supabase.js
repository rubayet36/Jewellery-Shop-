import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://duzqdqxzatvmoehinxlt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFkcXh6YXR2bW9laGlueGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDcxMjEsImV4cCI6MjA5MzQ4MzEyMX0.WbPZhEr-yhLLOIsUaqU2gIOrrEb3hio6R3dobUnw_bg";

export const supabase = createClient(supabaseUrl, supabaseKey);
