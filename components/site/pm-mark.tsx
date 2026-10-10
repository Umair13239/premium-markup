import { PMIcon } from "@/components/brand/logo";

// Brand icon (kept under its old name for existing call sites).
export function PMMark({ className = "" }: { className?: string; accent?: string }) {
  return <PMIcon className={className} />;
}
