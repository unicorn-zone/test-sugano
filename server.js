import { serve } from "https://deno.land/std@0.138.0/http/server.ts";

import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.34.0'

const supabaseUrl = 'https://wobbwwarztalycvfzbrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYmJ3d2FyenRhbHljdmZ6YnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY2NzU0NzMzNywiZXhwIjoxOTgzMTIzMzM3fQ.PVoH1ICq3GEIi3NXTMIuIZBcBaH9aJTyl4Qthj9RQnY';
const supabase = createClient(supabaseUrl, supabaseKey);
let spObj;

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "POST" && pathname === "/get_db") {
    const requestJson = await req.json();
    let id = Number(requestJson.id);
    spObj = await supabase.from('testtb').select();
    if (spObj.error == null) {
      let comment = spObj.data[id].comment;
      let time = spObj.data[id].created_at;
      return new Response(comment + '@' + time);
    } else {
      return new Response(spObj.error.message);
    }
  }

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