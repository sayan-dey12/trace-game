import { Router } from "express";
import { getClientIP, getGeoForIP } from "../lib/ip";
import { detectVPN } from "../lib/vpn";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Called only after explicit consent on client:
 * logs ip, ua, geo, vpn; stores into Supabase events table.
 */
router.get("/", async (req, res) => {
  try {
    const ip = getClientIP(req);
    const ua = req.get("User-Agent") || "";

    const geo = await getGeoForIP(ip);
    const vpn = await detectVPN(ip);

    // insert into supabase events table
    const { data, error } = await supabase
      .from("events")
      .insert([{
        ip,
        user_agent: ua,
        city: geo.city || null,
        region: geo.region || null,
        country: geo.country_name || geo.country || null,
        vpn_info: vpn || null
      }])
      .select("*")
      .limit(1);

    return res.json({
      ok: true,
      ip,
      ua,
      geo: { city: geo.city, region: geo.region, country: geo.country_name },
      vpn,
      event: data && data[0] ? data[0] : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

export default router;
