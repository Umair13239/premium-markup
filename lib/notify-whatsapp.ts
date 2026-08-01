/**
 * Sends a WhatsApp message to YOUR own number so a live-chat request reaches you
 * instantly. Uses CallMeBot (free, no Meta approval). One-time setup:
 *   1. Add the CallMeBot number +34 644 51 95 23 to your WhatsApp contacts.
 *   2. Send it:  "I allow callmebot to send me messages"
 *   3. It replies with your API key.
 *   4. Put these in website/.env (and Vercel env):
 *        WHATSAPP_NOTIFY_PHONE=447451296502   (your number, digits only, no +)
 *        CALLMEBOT_APIKEY=xxxxxxx
 * Without those two env vars this is a silent no-op (nothing breaks).
 */
export async function notifyWhatsApp(text: string): Promise<boolean> {
  const phone = process.env.WHATSAPP_NOTIFY_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return false;
  try {
    const url =
      "https://api.callmebot.com/whatsapp.php?phone=" +
      encodeURIComponent(phone) +
      "&text=" +
      encodeURIComponent(text) +
      "&apikey=" +
      encodeURIComponent(apikey);
    const r = await fetch(url, { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
}
