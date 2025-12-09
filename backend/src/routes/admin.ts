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
// TOKEN SYSTEM
// ---------------------------
function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

let activeTokens = new Set<string>();

function verifyAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!activeTokens.has(token)) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

// ---------------------------
// LOGIN
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
// EVENTS
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
// UPLOADS
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
// DELETE ONE UPLOAD
// ---------------------------
router.delete("/delete-upload/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ ok: false, error: "missing_public_id" });
  }

  try {
    await cloudinary.uploader.destroy(public_id);

    const { error } = await supabase.from("uploads").delete().eq("id", id);
    if (error) return res.status(400).json({ ok: false, error });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ ok: false, error: "delete_failed" });
  }
});

// ---------------------------
// DELETE ALL UPLOADS
// ---------------------------
router.delete("/delete-all", verifyAdmin, async (req, res) => {
  try {
    const { data } = await supabase.from("uploads").select("cloudinary_public_id");

    if (!data || data.length === 0) {
      return res.json({ ok: true, message: "No uploads to delete" });
    }

    // Delete all Cloudinary files
    for (const row of data) {
      if (row.cloudinary_public_id) {
        await cloudinary.uploader.destroy(row.cloudinary_public_id);
      }
    }

    // Delete all rows in Supabase
    await supabase.from("uploads").delete().neq("id", 0);

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete All Error:", err);
    return res.status(500).json({ ok: false, error: "delete_all_failed" });
  }
});

export default router;
