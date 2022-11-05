import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.34.0';

let url = 'https://ekzwclcfheomwmnteywk.supabase.co';
let anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrendjbGNmaGVvbXdtbnRleXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc1NzE2NjQsImV4cCI6MTk4MzE0NzY2NH0.5ZeHJT23ZrIzOWJQtP4AncFpqCMp-lB2xbxXF592zpg';
const supabase = createClient(url, anon_key);
let obj;
let main_obj;

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  //　コーディネート初期化
  if (req.method === "GET" && pathname === "/reset_obj") {
    main_obj = await supabase.from('calendar').select().rangeGt('date_start', '[2022-11-01 00:00, 2022-11-01 00:00)');
  }

  // コーディネートの投稿
  if (req.method === "POST" && pathname === "/code_info") {
    const requestJson = await req.json();
    obj = await supabase.from('calendar').insert(requestJson); // calendarへデータ挿入
    if (obj.error == null) {
      return new Response("finished");
    } else {
      return new Response(obj.error.message);
    }
  }

  // データベース更新確認
  async function base_select() {
    main_obj = await supabase.from('calendar').select().rangeGt('date_start', '[2022-11-01 00:00, 2022-11-01 00:00)');
    return main_obj;
  };

  if (req.method === "POST" && pathname === "/code_info2") {
    const requestJson = await req.json();
    let group = requestJson.group;
    obj = await supabase.from('calendar').select().rangeGt('date_start', '[2022-11-01 00:00, 2022-11-01 00:00)').eq('group', group);
    if (obj.error == null) {
      let data = obj.data[0].created_at + '||';
      data = data + obj.data[0].date_start + '||';
      data = data + obj.data[0].date_end + '||';
      data = data + obj.data[0].comment + '@@';
      for (let i = 1; i < obj.data.length-1; i++) {
        data = data + obj.data[i].created_at + '||';
        data = data + obj.data[i].date_start + '||';
        data = data + obj.data[i].date_end + '||';
        data = data + obj.data[i].comment + '@@';
      }
      return new Response(data);
    } else {
      return new Response(obj.error.message);
    }
  }

  // 現在の投稿数を確認
  if (req.method === "GET" && pathname === "/code_info") {
    obj = await base_select();
    if (obj.error == null) {
      let max_id = obj.data.length-1;
      return new Response(max_id);
    }
  };

  // 投稿を削除
  if (req.method === "POST" && pathname === "/code_info_del") {
    const requestJson = await req.json();
    let id_del = Number(requestJson.id);
    obj = await supabase.from('calendar').select();
    if (obj.error == null) {
      let id = obj.data[id_del].id;
      obj = await supabase.from('calendar').delete().match({ id });
      return new Response(id_del-1);
    }
  };







  if (pathname === "/styles.css") {
    return new Response(await Deno.readTextFile("./public/styles.css"), {
      headers: { "Content-Type": "text/css; charset=utf-8" },
    });
  }

  return new Response(await Deno.readTextFile("./public/index.html"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });

});