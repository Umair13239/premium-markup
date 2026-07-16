import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ProcessTimeline } from "@/components/site/process-timeline";
import { Button } from "@/components/site/button";
import { Magnetic } from "@/components/site/magnetic";

export const metadata: Metadata = {
  title: "Process — how a web project runs, step by step",
  description:
    "A clear six-step process for every project: discover, define, design, develop, refine, launch and support. Fixed scope and price agreed up front.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        label="process"
        title="A clear process. No guesswork."
        intro="Every project runs the same way: understand the goal, agree the scope in writing, and build it properly. You always know what happens next and what it costs."
      />
      <ProcessTimeline />

      <section className="band">
        <div className="container-editorial py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-2xl text-3xl text-paper md:text-4xl">Know the goal? That&rsquo;s enough to start.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[color:var(--color-paper-dim)]">Tell us what you&rsquo;re planning. We&rsquo;ll map the shortest route to a result and quote a fixed price.</p>
          <div className="mt-8 flex justify-center">
            <Magnetic><Button href="/contact" variant="invert">Start a project</Button></Magnetic>
          </div>
        </div>
      </section>
    </>
  );
}
