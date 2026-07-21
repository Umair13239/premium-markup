import { EmailWriterClient } from "@/components/admin/email-writer-client";
import { aiComposeStatus } from "@/lib/ai-compose";
import { tursoEnabled } from "@/lib/turso";

export const dynamic = "force-dynamic";

export default async function EmailWriterPage() {
  const status = await aiComposeStatus();
  return (
    <EmailWriterClient
      aiReady={!!status.enabled}
      aiModel={status.model || ""}
      prospectsAvailable={tursoEnabled()}
    />
  );
}
