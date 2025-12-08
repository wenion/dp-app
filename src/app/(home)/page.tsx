"use client";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center bg-gray-100 text-slate-900 h-screen">
      <div className="bg-white flex flex-col w-full max-w-7xl transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="flex py-6 px-16 text-base pt-20 pb-40">
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-sky-700">Project Overview 💡</h2>
              <p className="mt-2 text-slate-700">
                This project develops and tests the first{" "}
                <span className="font-bold text-sky-700 underline decoration-wavy decoration-sky-500/50">
                  evidence-centred assessment framework
                </span>{" "}
                for student writing in higher education that explicitly accounts
                for human–AI collaboration with tools like ChatGPT.
              </p>
            </div>

            {/* Light card styles: white background, gray border, softer shadow */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2 border-b border-gray-200 pb-1">
                  Focus domains
                </p>
                <p className="text-base font-bold text-sky-700">
                  Information Technology &amp; Law
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Two contrasting disciplines with distinct writing genres and demands.
                </p>
              </div>
              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2 border-b border-gray-200 pb-1">
                  Study designs
                </p>
                <p className="text-base font-bold text-sky-700">
                  Lab &amp; field studies
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Controlled experiments and real-classroom deployments at scale.
                </p>
              </div>
              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2 border-b border-gray-200 pb-1">
                  Methods
                </p>
                <p className="text-base font-bold text-sky-700">
                  Learning analytics · SRL · ECD · GAI
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Integrating self-regulated learning, evidence-centred design, and
                  Generative AI.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-md hover:border-violet-500 transition-colors">
                <h3 className="text-lg font-semibold text-violet-700">Why now? ⏰</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Generative AI tools are being embedded into productivity suites and
                  everyday writing workflows. Traditional “pen-and-paper” assessments
                  no longer reflect authentic practice and risk misrepresenting what
                  students can do in real contexts.
                </p>
              </div>
              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-md hover:border-amber-500 transition-colors">
                <h3 className="text-lg font-semibold text-amber-700">Our response ✅</h3>
                <p className="mt-1 text-sm text-gray-600">
                  We redesign assessment around{" "}
                  <span className="text-sky-700 font-bold">
                    human–AI collaboration, self-regulated learning, and formative feedback
                  </span>
                  , moving beyond a narrow focus on AI detection or prohibition.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="flex gap-6 pt-8 pb-4 flex-wrap items-center justify-center text-sm text-gray-500">
        All rights reserved @2025 · Monash University ARC Discovery Project
      </footer>
    </div>
  );
}