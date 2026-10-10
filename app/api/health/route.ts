// Liveness probe (auth-gated by middleware like the rest of /api).
export function GET() {
  return Response.json({ ok: true });
}
