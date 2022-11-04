import { serve } from "https://deno.land/std@0.138.0/http/server.ts";

import { createClient } from '@supabase/supabase-js';

let supabaseUrl = 'https://wobbwwarztalycvfzbrk.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYmJ3d2FyenRhbHljdmZ6YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc1NDczMzcsImV4cCI6MTk4MzEyMzMzN30.st9kLjwidM-T1iOxZjqsvxx4xtfe4xN597mjnRhImDE';
const supabase = createClient(supabaseUrl, supabaseKey);


serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "POST" && pathname === "/code_info") {
    const requestJson = await req.json();
    spObj = await supabase.from('testtb').insert(requestJson);
  }


  if (pathname === "/styles.css") {
    return new Response(await Deno.readTextFile("./public/styles.css"), {
      headers: { "Content-Type": "text/css; charset=utf-8" },
    });
  }

  return new Response(await Deno.readTextFile("./public/index.html"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});