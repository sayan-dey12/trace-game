import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ---------------------------
// SIMPLE TOKEN SYSTEM
// ---------------------------
function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

let activeTokens = new Set<string>();

function verifyAdmin(req:any, res:any, next:any ) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!activeTokens.has(token)) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  next();
}

// ---------------------------
// ADMIN LOGIN
// ---------------------------
router.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    const token = generateToken();
    activeTokens.add(token);

    return res.json({ ok: true, token });
  }

  return res.status(401).json({ ok: false, error: "invalid_credentials" });
});

// ---------------------------
// GET EVENTS (protected)
// ---------------------------
router.get("/events", verifyAdmin, async (req, res) => {
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  res.json(data || []);
});

// ---------------------------
// GET UPLOADS (protected)
// ---------------------------
router.get("/uploads", verifyAdmin, async (req, res) => {
  const { data } = await supabase
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  res.json(data || []);
});

// ---------------------------
// DELETE UPLOAD (protected)
// ---------------------------
router.delete("/delete-upload/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ ok: false, error: "missing_public_id" });
  }

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Delete from Supabase
    const { error } = await supabase
      .from("uploads")
      .delete()
      .eq("id", id);

    if (error) return res.status(400).json({ ok: false, error });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ ok: false, error: "delete_failed" });
  }
});

export default router;
