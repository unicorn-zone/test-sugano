import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
console.log("Listening on http://localhost:8000");

serve(req => {
    return new Response("Hello World!!!!!!!!!!!!!");
});