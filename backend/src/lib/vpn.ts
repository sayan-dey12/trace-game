import axios from "axios";

/** VPN/proxy detection wrapper using IPQualityScore-like API.
 *  Example: https://ipqualityscore.com/documentation/proxy-vpn-detection-api/overview
 *  Set VPN_DETECT_API and VPN_DETECT_KEY in .env
 */
export async function detectVPN(ip: string) {
  try {
    const key = process.env.VPN_DETECT_KEY;
    const base = process.env.VPN_DETECT_API;
    if (!key || !base) return { warning: "no_vpn_api_key" };

    const url = `${base}${key}/${ip}`;
    const r = await axios.get(url, { timeout: 7000 });
    // r.data usually has proxy, vpn, tor, active_vpn, etc.
    return r.data || {};
  } catch (e) {
    console.warn("vpn detect failed", e);
    return { error: "vpn_lookup_failed" };
  }
}
