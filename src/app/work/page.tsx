"use client";

export default function Home() {
  return (
    <>
      <div className="bg-white flex flex-col flex-1 w-full transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="flex py-6 px-16 text-base pt-10">
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-sky-700">Work Packages 🛠️</h2>
            <p className="text-sm text-gray-600">
              Four tightly integrated work packages structure the project from
              co-design, through experimentation, to deployment at classroom scale.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Light card styles, border color matches accent */}
              <article className="rounded-2xl border border-sky-300 bg-sky-50/50 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs uppercase tracking-[0.2em] text-sky-600 mb-1">
                  WP1 · Co-design
                </div>
                <h3 className="text-base font-bold mb-2 text-sky-900">
                  Assessment &amp; feedback design
                </h3>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside flex-1 ml-2">
                  <li>Co-design with IT and Law educators and students.</li>
                  <li>Student model, task model, and evidence model specification.</li>
                  <li>Design of feedback representations for teachers.</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {/* Light tag styles */}
                  <span className="rounded-full bg-sky-200/50 border border-sky-400 px-2.5 py-1 text-sky-800">
                    Quantitative ethnography
                  </span>
                  <span className="rounded-full bg-sky-200/50 border border-sky-400 px-2.5 py-1 text-sky-800">
                    Interface prototyping
                  </span>
                </div>
              </article>

              <article className="rounded-2xl border border-violet-300 bg-violet-50/50 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs uppercase tracking-[0.2em] text-violet-600 mb-1">
                  WP2 · Lab studies
                </div>
                <h3 className="text-base font-bold mb-2 text-violet-900">
                  Controlled comparisons of GAI use
                </h3>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside flex-1 ml-2">
                  <li>GAI vs. non-GAI writing environments in IT &amp; Law.</li>
                  <li>Pre/post tests, surveys, and rich process trace data.</li>
                  <li>Network models of human–GAI writing processes.</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-violet-200/50 border border-violet-400 px-2.5 py-1 text-violet-800">
                    Regression modelling
                  </span>
                  <span className="rounded-full bg-violet-200/50 border border-violet-400 px-2.5 py-1 text-violet-800">
                    Epistemic network analysis
                  </span>
                </div>
              </article>

              <article className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs uppercase tracking-[0.2em] text-amber-600 mb-1">
                  WP3 · Field study
                </div>
                <h3 className="text-base font-bold mb-2 text-amber-900">
                  Real-classroom deployment
                </h3>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside flex-1 ml-2">
                  <li>Deployment in existing IT and Law courses.</li>
                  <li>Teachers use analytics-driven feedback tools.</li>
                  <li>
                    Evaluation of ecological validity and impact on teaching practice.
                  </li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-amber-200/50 border border-amber-400 px-2.5 py-1 text-amber-800">
                    Ecological validity
                  </span>
                  <span className="rounded-full bg-amber-200/50 border border-amber-400 px-2.5 py-1 text-amber-800">
                    Teacher feedback analysis
                  </span>
                </div>
              </article>

              <article className="rounded-2xl border border-indigo-300 bg-indigo-50/50 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs uppercase tracking-[0.2em] text-indigo-600 mb-1">
                  WP4 · Analytics &amp; GAI
                </div>
                <h3 className="text-base font-bold mb-2 text-indigo-900">
                  Analytics backbone
                </h3>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside flex-1 ml-2">
                  <li>Fine-tuned LLMs for IT and Law writing.</li>
                  <li>Classifiers for writing and SRL processes.</li>
                  <li>Automated writing quality scores &amp; process visualisations.</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-indigo-200/50 border border-indigo-400 px-2.5 py-1 text-indigo-800">
                    GAI fine-tuning
                  </span>
                  <span className="rounded-full bg-indigo-200/50 border border-indigo-400 px-2.5 py-1 text-indigo-800">
                    SRL detection
                  </span>
                  <span className="rounded-full bg-indigo-200/50 border border-indigo-400 px-2.5 py-1 text-indigo-800">
                    Process visualisation
                  </span>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>

      <footer className="flex gap-6 pt-8 pb-4 flex-wrap items-center justify-center text-sm text-gray-500 h-20">
        ARC Discovery Project (DP24) · Monash University · Centre for Learning Analytics at Monash (CoLAM)
      </footer>
    </>
  );
}