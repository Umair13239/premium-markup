# wa-checker — automatic WhatsApp checker

Auto-detects which of your lead phone numbers are on WhatsApp, so you never check them one by one.
It logs into **your own WhatsApp** once (via QR), then checks every number and writes the results back
for the dashboard to load.

> ⚠️ **Read this first.** WhatsApp has no official "is this number registered?" API. This tool drives
> WhatsApp Web with your account. **Checking hundreds of numbers from a personal number can get it
> temporarily rate-limited or banned** — this is against WhatsApp's Terms at volume. Go slow, check in
> small batches, and use at your own risk. For zero risk, use a paid validation API instead.

## One-time setup
You need **Node.js** installed (https://nodejs.org). Then, in this `wa-checker` folder:

```bash
npm install
```

## Every time you want to check numbers

**If the database server is running** (you started the main app with `npm start`), the checker
automatically pulls the numbers from it and **writes the results straight back to the database** —
just run `npm start` here and refresh the dashboard when it's done. No file juggling needed.

**Otherwise (offline / no server):**
1. In the dashboard, open **WhatsApp Check → Export numbers**. Save `wa-numbers.json` and move it
   **into this folder**. (If you skip this, the tool falls back to the built-in leads in `../data.js`.)
2. Run:
   ```bash
   npm start
   ```
3. The first run shows a **QR code** in the terminal. On your phone: **WhatsApp → Settings → Linked devices
   → Link a device**, and scan it. (You won't need to scan again next time.)
4. It checks each number, printing progress, and saves `wa-results.json` as it goes.
5. Back in the dashboard, go to **Import** and **drag `wa-results.json` onto the drop zone**.
   Every lead now shows a ✅ / ❌ WhatsApp badge, and you can filter by it.

## Going slow & in batches (recommended)
Control speed and batch size with environment variables:

| Variable | Meaning | Default |
|----------|---------|---------|
| `DELAY_MS` | milliseconds to wait between each number | `2500` |
| `LIMIT` | only check this many un-checked numbers this run (`0` = all) | `0` |

Examples:

```bash
# mac / linux
DELAY_MS=4000 LIMIT=150 npm start

# Windows PowerShell
$env:DELAY_MS=4000; $env:LIMIT=150; npm start

# Windows cmd
set "DELAY_MS=4000" && set "LIMIT=150" && npm start
```

Progress is **saved after every number** and the tool **resumes** where it left off, so you can safely
stop (Ctrl+C) and run again later — it skips numbers already checked. Delete `wa-results.json` to start over.

## Files
| File | What it is |
|------|-----------|
| `wa-numbers.json` | input — numbers exported from the dashboard (you place this here) |
| `wa-results.json` | output — results to import back into the dashboard |
| `.wwebjs_auth/` | saved WhatsApp session so you don't re-scan the QR (keep private, don't share) |
