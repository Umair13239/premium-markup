import type { MDXComponents } from "mdx/types";

// Global MDX element styling — keeps blog posts on-brand and readable.
// Required by @next/mdx with the App Router.
const components: MDXComponents = {
  h2: (props) => <h2 className="mt-12 text-2xl md:text-3xl" {...props} />,
  h3: (props) => <h3 className="mt-8 text-xl" {...props} />,
  p: (props) => <p className="mt-4 text-lg leading-relaxed text-ink/90" {...props} />,
  ul: (props) => (
    <ul className="mt-4 space-y-2 pl-5 text-lg leading-relaxed text-ink/90 list-disc marker:text-cobalt" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-4 space-y-2 pl-5 text-lg leading-relaxed text-ink/90 list-decimal" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  a: (props) => <a className="text-cobalt link-underline" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 border-cobalt pl-5 text-muted italic" {...props} />
  ),
  hr: () => <hr className="my-10 border-line" />,
  code: (props) => (
    <code className="mono rounded-[4px] bg-[color:var(--color-line)] px-1.5 py-0.5 text-[0.9em]" {...props} />
  ),
};

export function useMDXComponents(existing: MDXComponents = {}): MDXComponents {
  return { ...existing, ...components };
}
