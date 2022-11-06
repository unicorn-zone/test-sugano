import { serve } from "https://deno.land/std@0.151.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.34.0'

import id_lat_lon_jsonData from "./public/id_lat_lon.json" assert { type: "json" };
import wbgt_people from "./public/wbgt_people.json" assert { type: "json" };


let pre_ids = [[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], [31], [33], [34], [32], [35], [36], [40], [41], [42], [43], [45], [44], [46], [54], [55], [56], [57], [49], [48], [52], [50], [51], [53], [60], [61], [62], [63], [64], [65], [69], [68], [66], [67], [81], [71], [72], [73], [74], [82], [85], [84], [86], [83], [87], [88], [91, 92, 93, 94]];
let url = 'https://akeajtagrjjhododqhpi.supabase.co';
let anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZWFqdGFncmpqaG9kb2RxaHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA2NTA2MjIsImV4cCI6MTk3NjIyNjYyMn0.QyhEX0CaRWChJpqsfvogNWmGGYB-yNJt7XcKbE825yQ';
const supabase = createClient(url, anon_key);
let obj; // Jsonobj, select(),insert()で使用
let main_obj = await supabase.from('items').select();
let lat;
let lon;

let post_key = 0;
let post_flg = 0;

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "GET" && pathname === "/tips") {
    
    let tips = ["熱中症の7・8月発生数は、1年のうちの9割を占めています。"];
    tips.push("お酒をたくさん飲んだ翌日は熱中症になりやすいので気を付けましょう。");
    tips.push("めまいがしたとき、涼しい場所へ行き、水分をとりましょう。");
    tips.push("熱中症になった時、脇の下、首、足のつけ根を冷やしましょう。");
    tips.push("熱中症予防のために水分だけでなく、塩分もとりましょう。");
    tips.push("アイスコーヒーは水分補給にあまり適しません。");
    tips.push("暑さ対策として半裸で過ごすのは、紫外線が直接肌に当たったり、汗を吸ってくれないのでよくありません。");
    tips.push("熱中症の発生が最も多い場所は自宅です。");
    tips.push("最も熱中症になりやすい年齢層は高齢者（65歳以上）です。");
    tips.push("人間は入浴中でも汗をかき、水分が失われます。入浴前と後の両方に水分をとりましょう。");
    tips.push("尿の色が濃いめの黄色がついていれば少し多めに水分をとる必要がある状態です。");
    tips.push("経口補水液を作るための材料として水、塩に加えて砂糖が必要です。");
    tips.push("熱中症予防の観点から、黒色の服は熱を吸収しやすいので避けましょう。");
    tips.push("熱中症予防に最も効果的なのは、麦わら帽子です。");
    tips.push("休憩を一回で済まさず、小分けにしましょう。");

    return new Response(tips[Math.floor(Math.random() * tips.length)]);
  }

  // 暑さ指数予測取得
  if (req.method === "POST" && pathname === "/loc") { // POSTメソッド，cieパス
    const requestJson = await req.json();
    lat = requestJson.lat; // 緯度
    lon = requestJson.lon; // 経度
    // 最近座標の観測所idを特定
    const keys = Object.keys(id_lat_lon_jsonData);
    let tmp_dis = 1000.0;
    let id="";
    for (let i in keys) {
      let key = keys[i];
      let tmp_lat = id_lat_lon_jsonData[key][0];
      let tmp_lon = id_lat_lon_jsonData[key][1];
      let dis = ((lat - tmp_lat) ** 2 + (lon - tmp_lon) ** 2) ** (1 / 2) // ユークリッド距離の算出
      if (dis < tmp_dis) {
        tmp_dis = dis;
        id = key;
      }
    }
    let pre_id = -1;
    for (let i in pre_ids) {
      for (let j in pre_ids[i]) {
        if (pre_ids[i][j] == id.substring(0, 2)) {
          pre_id = Number(i);
        }
      }
    }
    let wbgt_val;
    let people_val;

    async function callApi_wbgt(url_wbgt) {
      const data = CSV.toJSON(await CSV.fetch(url_wbgt))[0];
      let keys = Object.keys(data);
      let time = data[""].substring(0, 10).replace(/\//g, "");
      let max_key;
      let tmp_val = 0;
      for (let i in keys) {
        if (keys[i].substring(0, 8) == time) {
          let key = keys[i];
          let val = Number(data[key].substring(1));
          data[key] = val; // 数値をJSONobjに反映
          if (val > tmp_val) {
            tmp_val = val;
            max_key = key;
          }
        }
      }
      // let year = max_key.substring(0, 4);
      // let month = max_key.substring(4, 4 + 2);
      // let day = max_key.substring(6, 6 + 2);
      // let hour = max_key.substring(8);
      wbgt_val = data[max_key]/10;
      people_val = wbgt_people[pre_id][String(wbgt_val)];
    };
    const url_wbgt = 'https://www.wbgt.env.go.jp/prev15WG/dl/yohou_' + id + '.csv';
    callApi_wbgt(url_wbgt);

    // データ取得までsleep
    while (String(wbgt_val)=="undefined" || String(people_val)=="undefined") {
      const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await _sleep(50);
    }

    return new Response(String(wbgt_val) + ',' + String(people_val));
  }

  //　コーディネート初期化
  if (req.method === "GET" && pathname === "/reset_obj") {
    main_obj = await supabase.from('items').select();
  }

  // コーディネートの投稿
  if (req.method === "POST" && pathname === "/code_info") {
    const requestJson = await req.json();
    obj = await supabase.from('items').insert(requestJson); // itemsへデータ挿入
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
      main_obj = await supabase.from('items').select();
    }
    return main_obj;
  };

  // コーディネートの呼び出し（タイトル，コメント，画像データを返す）
  if (req.method === "POST" && pathname === "/code_info2") {
    const requestJson = await req.json();
    let id = Number(requestJson.id);
    obj = await base_select();
    if (obj.error == null) {
      let title = obj.data[id].title;
      let comment = obj.data[id].comment;
      let photo_data = obj.data[id].photo_data;
      let name = obj.data[id].name;
      let time = obj.data[id].created_at;
      return new Response(name + '@' + title + '@' + comment + '@' + photo_data + '@' + time);
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
    obj = await supabase.from('items').select();
    if (obj.error == null) {
      let id = obj.data[id_del].id;
      obj = await supabase.from('items').delete().match({ id });
      post_flg++;
      return new Response(id_del-1);
    }
  };


  // mapのために店舗情報を返す（緯度と経度を最初に受け取る）
  if (req.method === "POST" && pathname === "/search_shop") {
    const requestJson = await req.json();
    lat = requestJson.lat; // 緯度
    lon = requestJson.lon; // 経度
    let type_name = requestJson.point_name; //
    let type = type_name.split('@')[0];
    let place = type_name.split('@')[1];
    let dist = requestJson.dist;

    let shop_info;
    async function callApi_overpass(url_overpass) {
      await fetch(url_overpass)
        .then(function(response){
          return response.json();
        })
        .then(function(jsonData){
          // JSONデータを扱った処理など
          shop_info = jsonData;
        });
    };
    const url_overpass = 'http://overpass-api.de/api/interpreter?data=[out:json];node(around:'+dist*1000+',' + lat + ',' + lon + ')["' + type + '"="' + place + '"];out;';
    await callApi_overpass(url_overpass);

    let elements = shop_info.elements;
    let shop_lat = "", shop_lon = "", shop_name = "";
    let sp_key = "@@@";
    if (elements.length != 0) {
      for (let i in elements) {
        if (i == elements.length - 1) { sp_key = "" }
        shop_lat += String(elements[i].lat) + sp_key;
        shop_lon += String(elements[i].lon) + sp_key;
        if (String(elements[i].tags.name) != "undefined") {
          if (String(elements[i].tags.branch) != 'undefined') {
            shop_name += elements[i].tags.name + elements[i].tags.branch + sp_key;
          } else {
            shop_name += elements[i].tags.name + sp_key;
          }
        } else {
          shop_name += place + sp_key;
        }
      }

      // return_text : 属性\n区切り，項目@@@区切り
      let return_text = shop_lat + '\n' + shop_lon + '\n' + shop_name;
      console.log(return_text);
      return new Response(return_text);
    } else {
      return new Response("None");
    }
  };

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});