export const STATUSES = [
  "New",
  "Contacted",
  "In Conversation",
  "Proposal Sent",
  "Won",
  "Lost",
] as const;
export type Status = (typeof STATUSES)[number];

export const SOURCES = ["website", "manual", "imported"] as const;

export const statusTone: Record<string, string> = {
  New: "bg-cobalt/10 text-cobalt",
  Contacted: "bg-[#eef1fb] text-[#3b4a8a]",
  "In Conversation": "bg-[#fff2df] text-[#8a5a15]",
  "Proposal Sent": "bg-[#e9f6ef] text-[#1f7a4d]",
  Won: "bg-[#25d07d]/15 text-[#137a47]",
  Lost: "bg-[#fbeeed] text-tag",
};

/** Buckets lead createdAt dates into the last `weeks` ISO-week counts. */
export function weeklyBuckets(dates: Date[], weeks = 12) {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const end = now - (weeks - 1 - i) * week;
    return { end, count: 0 };
  });
  for (const d of dates) {
    const t = d.getTime();
    for (let i = 0; i < buckets.length; i++) {
      const start = buckets[i].end - week;
      if (t > start && t <= buckets[i].end + (i === buckets.length - 1 ? week : 0)) {
        buckets[i].count++;
        break;
      }
    }
  }
  return buckets.map((b, i) => ({ label: `${weeks - i}w`, count: b.count }));
}
