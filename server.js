import { serve } from "https://deno.land/std@0.138.0/http/server.ts";

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wobbwwarztalycvfzbrk.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)


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