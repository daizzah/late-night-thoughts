// /api/theme.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const allThemes = [
  "something you never said",
  "a memory you keep coming back to",
  "the thought that always hits at 2am",
  "one truth you try to ignore",
  "what you wish they knew",
  "something that changed you quietly",
  "a time you felt truly seen",
  "a moment you keep replaying",
  "the version of you that no one meets",
  "something that still lingers",
  "what haunts you softly",
  "the goodbye that didn’t feel real",
  "a lie you told to protect someone",
  "if you could go back, you’d…",
  "something that broke you but no one noticed",
  "something you miss but can’t explain",
  "a scent that brings you somewhere",
  "a song that still feels like a person",
  "the most peaceful memory you have",
  "when did time feel like it stopped?",
  "something you’re scared to forget",
  "a detail you always notice",
  "something they said that stuck",
  "a habit you didn’t realize was from them",
  "a place that holds meaning",
  "your favorite moment that felt small at the time",
  "one thing you’re thankful for",
  "something you’re learning to accept",
  "something you’ve healed from",
  "the kindest thing someone’s ever said to you",
  "a version of you you’re becoming",
  "the last time you felt truly proud",
  "a moment you chose yourself",
  "when you realized you’ve grown",
  "what feels like home lately",
  "something that reminded you of joy",
  "your personal definition of peace",
  "if today was a song, what would it be?",
  "what made you laugh today?",
  "a weird dream you had",
  "your most recent intrusive thought",
  "something small that made you smile",
  "a random realization u had",
  "something u said in ur head but not out loud",
  "the vibe of your day in 3 words",
  "a weird memory that resurfaced",
  "how are u different now?",
  "what would the younger you think of you today?",
  "something you only admit in your head",
  "if someone wrote about u, what would they say?",
  "how do u define love?",
  "something you wish you believed",
  "a label you feel but don’t say out loud",
  "the part of you people don’t get",
  "who are you when no one's around?",
  "what part of u is still hiding?",
  "something you never got to say",
  "the moment it started to change",
  "a feeling you miss",
  "what you needed to hear",
  "something that meant everything at the time",
  "i knew it was over when…",
  "a thought you always avoid",
  "if you could relive one moment",
  "the version of you from a year ago",
  "a goodbye that didn’t feel like one",
  "what you still wonder about",
  "something you never told anyone",
  "the thing that hurt more than it should’ve",
  "your quietest regret",
  "a moment you realized you’ve changed",
  "what peace would look like for you",
  "the thing you wish you’d said back",
  "if you could visit your past self",
];

function getTodayDateStr() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export default async function handler(req, res) {
  console.log(
    "🌙 running /api/theme with key:",
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 5) || "undefined"
  );

  const today = getTodayDateStr();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("night_themes")
      .select("theme")
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching theme:", error);
      return res.status(500).json({ error: "Failed to fetch theme" });
    }

    if (!data) {
      const randomTheme =
        allThemes[Math.floor(Math.random() * allThemes.length)];

      const { data: insertData, error: insertError } = await supabase
        .from("night_themes")
        .insert({ theme: randomTheme, date: today })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return res.status(500).json({ error: "Failed to set theme" });
      }

      return res.status(200).json({ theme: insertData.theme });
    }

    return res.status(200).json({ theme: data.theme });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
