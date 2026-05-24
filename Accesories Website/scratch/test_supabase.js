import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://duzqdqxzatvmoehinxlt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFkcXh6YXR2bW9laGlueGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDcxMjEsImV4cCI6MjA5MzQ4MzEyMX0.WbPZhEr-yhLLOIsUaqU2gIOrrEb3hio6R3dobUnw_bg";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: products, error: pError } = await supabase.from("products").select("*, categories(name)").limit(5);
  console.log("PRODUCTS DATA (First 5):");
  console.log(JSON.stringify(products, null, 2));
  
  const { data: categories, error: cError } = await supabase.from("categories").select("*");
  console.log("CATEGORIES DATA:");
  console.log(JSON.stringify(categories, null, 2));
}

test();
