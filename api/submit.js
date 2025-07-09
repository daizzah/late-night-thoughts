import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, theme, timestamp } = req.body;

  if (!text || text.length > 800) {
    return res.status(400).json({ error: "invalid post content" });
  }

  const { error } = await supabase.from("posts").insert([
    {
      text,
      theme,
      created_at: timestamp || new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("supabase error:", error);
    return res.status(500).json({ error: "db error" });
  }

  res.status(200).json({ success: true });
}
