import Link from "next/link";
import { PMMark } from "@/components/site/pm-mark";
import { Button } from "@/components/site/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative">
        <Link href="/" className="mx-auto mb-10 flex w-fit items-center gap-2.5 font-display text-lg font-extrabold tracking-tight" aria-label="Premium Markup home">
          <PMMark className="h-7 w-7" />
          Premium<span className="text-cobalt">Markup</span>
        </Link>

        <p className="tag-label">{"<!-- 404 -->"}</p>
        <h1 className="mt-3 font-display text-7xl font-extrabold tracking-tight md:text-9xl">404</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          That page has moved, been renamed, or never existed. No harm done — here are the useful routes.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button href="/">Back to home</Button>
          <Button href="/work" variant="secondary">See our work</Button>
          <Button href="/contact" variant="ghost">Start a project</Button>
        </div>

        <div className="mono mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/services" className="hover:text-cobalt">Services</Link>
          <Link href="/about" className="hover:text-cobalt">About</Link>
          <Link href="/process" className="hover:text-cobalt">Process</Link>
          <Link href="/blog" className="hover:text-cobalt">Blog</Link>
        </div>
      </div>
    </main>
  );
}
