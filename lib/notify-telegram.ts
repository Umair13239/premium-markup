/**
 * Sends a Telegram message to you when a live-chat request comes in. Reliable,
 * instant, free. Setup:
 *   1. On Telegram, message @BotFather → /newbot → follow prompts → copy the token.
 *   2. Open your new bot and send it any message (so it can find your chat).
 *   3. Put these in website/.env (and Vercel env):
 *        TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
 *        TELEGRAM_CHAT_ID=987654321
 * Without both env vars this is a silent no-op (nothing breaks).
 */
export async function notifyTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
