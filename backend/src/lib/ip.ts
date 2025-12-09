import axios from "axios";
import { Request } from "express";

/** extract client IP, taking x-forwarded-for into account */
export function getClientIP(req: Request): string {
  const raw = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
  return raw.split(",")[0].trim();
}

/** ip -> geo via ipapi.co (demo). Replace with your provider if needed. */
export async function getGeoForIP(ip: string) {
  try {
    const base = process.env.IP_GEO_PROVIDER_URL || "https://ipapi.co";
    const url = `${base}/${ip}/json/`;
    const r = await axios.get(url, { timeout: 5000 });
    return r.data || {};
  } catch (e) {
    console.warn("geo lookup failed", e);
    return {};
  }
}
