import { Button } from "./button";

export function PostCTA() {
  return (
    <section className="band">
      <div className="container-editorial py-16 text-center md:py-20">
        <p className="tag-label">{'<aside class="cta">'}</p>
        <h2 className="mx-auto mt-3 max-w-xl text-3xl text-paper md:text-4xl">
          Thinking about a website that actually works?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[color:var(--color-paper-dim)]">
          Tell us about your business. Honest advice, a fixed quote, and no hard sell.
        </p>
        <div className="mt-8">
          <Button href="/contact" variant="invert">
            Start a project
          </Button>
        </div>
      </div>
    </section>
  );
}
