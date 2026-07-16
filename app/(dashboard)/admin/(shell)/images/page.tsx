import { ImagesClient } from "@/components/admin/images-client";
import { SITE_IMAGES } from "@/lib/site-images";

export const dynamic = "force-dynamic";

export default function AdminImagesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <h1 className="text-2xl">Site Images</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Regenerate any image on the website from a prompt. The new image replaces the old one in place —
        alt text, sizing and metadata stay exactly as they are. Uses Qwen by default, with Cloudflare Flux as
        an automatic fallback.
      </p>
      <ImagesClient images={SITE_IMAGES} />
    </div>
  );
}
