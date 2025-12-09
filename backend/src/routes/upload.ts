import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getClientIP } from "../lib/ip";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// local temp storage for multer
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * Expects:
 * - form-data 'photo' (file)
 * - 'consent' = 'yes' (string)
 * - optional latitude, longitude
 * - optional event_id to link the upload to an event
 */
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const consent = req.body.consent;

    // ❌ If user doesn’t give consent
    if (consent !== "yes") {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ ok: false, error: "consent_required" });
    }

    // ❌ If file is missing
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "no_file" });
    }

    // ✅ TypeScript now knows "file" is ALWAYS defined
    const file = req.file;

    const ip = getClientIP(req);
    const ua = req.get("User-Agent") || "";
    const latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
    const longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;
    const event_id = req.body.event_id || null;

    // ✅ Upload to Cloudinary using "file"
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(file.path, { folder: "consent-trace" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Remove local temp file
    try { fs.unlinkSync(file.path); } catch (e) {}

    // Insert into Supabase
    const { data, error } = await supabase.from("uploads").insert([{
      event_id,
      cloudinary_url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id,
      filename: file.originalname || uploadResult.public_id,
      ip,
      user_agent: ua,
      latitude,
      longitude
    }]).select("*").limit(1);

    return res.json({
      ok: true,
      upload: data && data[0] ? data[0] : null,
      cloudinary: uploadResult
    });

  } catch (err) {
    console.error("upload error", err);
    return res.status(500).json({ ok: false, error: "upload_failed" });
  }
});
export default router;
