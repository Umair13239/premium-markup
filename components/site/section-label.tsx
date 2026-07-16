/**
 * Signature device: section labels written as HTML comments — <!-- services -->
 * Quiet, consistent, a wink at the craft. Decorative for screen readers; the
 * section's real heading carries the semantics.
 */
export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="tag-label" aria-hidden="true">
      {`<!-- ${children} -->`}
    </p>
  );
}
