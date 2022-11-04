import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.34.0';

let url = 'https://ekzwclcfheomwmnteywk.supabase.co';
let anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrendjbGNmaGVvbXdtbnRleXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc1NzE2NjQsImV4cCI6MTk4MzE0NzY2NH0.5ZeHJT23ZrIzOWJQtP4AncFpqCMp-lB2xbxXF592zpg';
const supabase = createClient(url, anon_key);
let obj;
let main_obj = await supabase.from('calendar').select();
let post_key = 0;
let post_flg = 0;

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  //　コーディネート初期化
  if (req.method === "GET" && pathname === "/reset_obj") {
    main_obj = await supabase.from('calendar').select();
  }

  // コーディネートの投稿
  if (req.method === "POST" && pathname === "/code_info") {
    const requestJson = await req.json();
    obj = await supabase.from('calendar').insert(requestJson); // calendarへデータ挿入
    post_flg++;
    if (obj.error == null) {
      return new Response("finished");
    } else {
      return new Response(obj.error.message);
    }
  }

  // データベース更新確認
  async function base_select() {
    if (post_key != post_flg) {
      post_key = post_flg;
      main_obj = await supabase.from('calendar').select();
    }
    return main_obj;
  };

  if (req.method === "POST" && pathname === "/code_info2") {
    const requestJson = await req.json();
    let id = Number(requestJson.id);
    obj = await base_select();
    if (obj.error == null) {
      let comment = obj.data[id].comment;
      let time = obj.data[id].created_at;
      return new Response(comment + '@' + time);
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
      post_flg++;
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