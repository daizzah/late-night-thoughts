import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false }) // newest first
    .limit(50); // adjust if you want fewer or more

  if (error) {
    console.error("❌ failed to load posts:", error);
    return res.status(500).json({ error: "failed to load posts" });
  }

  return res.status(200).json({ posts: data });
}
