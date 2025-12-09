import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// simple login check against env vars
router.post("/login", (req, res) => {
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false });
});

// fetch events
router.get("/events", async (req, res) => {
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(200);
  res.json(data || []);
});

// fetch uploads
router.get("/uploads", async (req, res) => {
  const { data, error } = await supabase.from("uploads").select("*").order("created_at", { ascending: false }).limit(200);
  res.json(data || []);
});

export default router;
