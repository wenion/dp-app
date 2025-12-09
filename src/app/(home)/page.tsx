"use client";

export default function Home() {
  return (
    // <div className="font-sans flex flex-col items-center bg-gray-100 text-slate-900">
    <>
      <div className="bg-white flex flex-col flex-1 w-full transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="flex flex-col py-6 px-16 text-base mt-auto mb-auto">
          <section className="py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
              Re-thinking Assessment in the Age of{" "}
              <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-amber-500 bg-clip-text text-transparent">
                Generative AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mb-8">
              This project develops and tests the first{" "}
              <strong>evidence-centred assessment framework</strong> for student
              writing in higher education that explicitly accounts for{" "}
              <strong>human–AI collaboration</strong> with tools like ChatGPT
            </p>

            <div className="flex space-x-4">
              {/* Key Metrics / Boxes from the previous overview */}
              <div className="bg-white p-4 rounded-xl border border-sky-300 shadow-lg text-sm max-w-[250px]">
                <p className="uppercase text-xs font-semibold tracking-widest text-sky-600 mb-1">Focus Domains</p>
                <p className="font-bold text-lg text-sky-800">Information Technology &amp; Law</p>
                <p className="text-gray-600">Two contrasting disciplines spanning STEM and humanities writing.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-violet-300 shadow-lg text-sm max-w-[250px]">
                <p className="uppercase text-xs font-semibold tracking-widest text-violet-600 mb-1">Methodology</p>
                <p className="font-bold text-lg text-violet-800">Lab &amp; Field Studies</p>
                <p className="text-gray-600">Controlled lab experiments and real-classroom deployments across IT and Law.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-lg text-sm max-w-[250px] hidden sm:block">
                <p className="uppercase text-xs font-semibold tracking-widest text-amber-600 mb-1">Core Concepts</p>
                <p className="font-bold text-lg text-amber-800">LA · SRL · ECD · GAI</p>
                <p className="text-gray-600">
                  Integrating Learning Analytics, Self-Regulated Learning,
                  Evidence-Centred Design, and Generative AI.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          {/* --- 2. GOALS AND AIMS --- */}
          <section id="aims" className="py-8 scroll-mt-20">
            <h2 className="text-3xl font-bold text-sky-700 mb-6">
              🎯 Project Goals &amp; Aims
            </h2>
            <p className="text-lg text-gray-600 max-w-5xl mb-6">
              Our project aims to fill a critical gap in knowledge by developing and
              testing a novel assessment framework that accounts for the interactions
              between learners and increasingly sophisticated tools like generative AI.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Core Research Aims */}
              <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-md">
                <h3 className="text-xl font-semibold text-sky-800 mb-3">
                  Core Research Aims
                </h3>
                <ul className="space-y-3 text-base text-slate-700 list-disc list-inside ml-4">
                  <li>
                    <strong>Develop, refine, and evaluate</strong> an
                    evidence-centred framework for assessing GAI-enhanced writing that
                    accounts for complex interactions between learners and tools.
                  </li>
                  <li>
                    <strong>Deploy human-centred assessment systems</strong> for two
                    distinct genres of writing (IT and Law).
                  </li>
                  <li>
                    <strong>Investigate the affordances and constraints</strong> of
                    GAI-enhanced writing practices compared to traditional practices.
                  </li>
                  <li>
                    <strong>Derive recommendations</strong> for coherent assessment of
                    GAI-enhanced writing and the effective use of GAI for writing
                    support.
                  </li>
                </ul>
              </div>

              {/* Expected Benefits */}
              <div className="bg-white p-6 rounded-xl border border-violet-200 shadow-md">
                <h3 className="text-xl font-semibold text-violet-800 mb-3">
                  Expected Benefits &amp; Outcomes
                </h3>
                <ul className="space-y-3 text-base text-slate-700 list-disc list-inside ml-4">
                  <li>
                    Deliver the first feasible, valid, and reliable means for the{" "}
                    <strong>evidence-centred assessment</strong> of GAI-enhanced
                    writing.
                  </li>
                  <li>
                    Expand theoretical understanding of{" "}
                    <strong>authentic assessment practices</strong>, the cognitive and
                    metacognitive dimensions of writing, and how AI supports or
                    inhibits these dimensions.
                  </li>
                  <li>
                    Provide a refinable{" "}
                    <strong>blueprint for assessment</strong> of GAI-enhanced writing
                    in other domains (e.g., programming).
                  </li>
                  <li>
                    Generate evidence-based guidance for universities on{" "}
                    <strong>coherent assessment policies</strong>.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          {/* --- 3. THE PROBLEM --- */}
          <section id="problem" className="py-8 scroll-mt-20">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              ⏰ The Challenge of GAI in Assessment
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Challenge 1 */}
              <div className="bg-white p-6 rounded-xl border border-amber-300 shadow-md">
                <h3 className="text-xl font-semibold text-amber-800 mb-3">
                  AI Ubiquity vs. Traditional Practices
                </h3>
                <p className="text-gray-700">
                  Generative AI tools are becoming{" "}
                  <strong>ubiquitous</strong> and will be integrated into widely used
                  office software, making their use commonplace. Traditional{" "}
                  <strong>&quot;pen-and-paper&quot; assessments</strong> separate
                  learners from these tools, measuring skills that may not be socially
                  valuable or authentic.
                </p>
              </div>

              {/* Challenge 2 */}
              <div className="bg-white p-6 rounded-xl border border-amber-300 shadow-md">
                <h3 className="text-xl font-semibold text-amber-800 mb-3">
                  The Evidence Collection Gap
                </h3>
                <p className="text-gray-700">
                  Present assessment designs struggle to account for the{" "}
                  <strong>interdependence</strong> between humans and tools.
                  Existing GAI interactions often occur in separate interfaces,
                  meaning learners can use GAI{" "}
                  <strong>without providing assessment evidence</strong>.
                </p>
              </div>

              {/* Challenge 3 */}
              <div className="bg-white p-6 rounded-xl border border-amber-300 shadow-md">
                <h3 className="text-xl font-semibold text-amber-800 mb-3">
                  Collaborative Writing vs. Individual Analysis
                </h3>
                <p className="text-gray-700">
                  Writing with GAI is a{" "}
                  <strong>collaborative, not individual, act</strong>. Current
                  methods often emphasise the <strong>final product</strong> rather
                  than the <strong>process</strong>, which endangers assessment
                  validity in collaborative contexts and misses opportunities for{" "}
                  <strong>formative feedback</strong>.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          {/* --- 4. SOLUTION & FRAMEWORK (ECD) --- */}
          <section id="framework" className="py-8 scroll-mt-20">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">
              💡 Solution: Evidence-Centred Design (ECD) Framework
            </h2>
            <p className="text-lg text-gray-600 max-w-5xl mb-6">
              We will develop an evidence-centred framework that supports student
              learning through teacher-provided feedback by leveraging our expertise
              in learning analytics and collaborative interaction modelling.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Student Model */}
              <div className="bg-indigo-50 p-6 rounded-xl border-t-4 border-indigo-500 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                  Student Model
                </h3>
                <p className="text-sm uppercase font-medium text-indigo-600 mb-3">
                  What claims are we making?
                </p>
                <p className="text-gray-700">
                  Describes a set of claims about participants&apos; learning.
                  Structured around the{" "}
                  <strong>SR-WMS typology</strong> (Self-Regulation in Writing from
                  Multiple Sources), it maps metacognitive, semantic, and rhetorical
                  features of writing and considers which features apply to the{" "}
                  <strong>author versus the GAI</strong>.
                </p>
              </div>

              {/* Task Model */}
              <div className="bg-indigo-50 p-6 rounded-xl border-t-4 border-indigo-500 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                  Task Model
                </h3>
                <p className="text-sm uppercase font-medium text-indigo-600 mb-3">
                  What activities &amp; environment are used?
                </p>
                <p className="text-gray-700">
                  Describes the activities participants do and the environment where
                  they take place. We design and implement a{" "}
                  <strong>GAI-enhanced writing environment</strong> (building on the
                  existing Casenotes Writing Tool, CWT) that includes rich text
                  editing, source organisation, and a{" "}
                  <strong>GAI-powered chatbot</strong>.
                </p>
              </div>

              {/* Evidence Model */}
              <div className="bg-indigo-50 p-6 rounded-xl border-t-4 border-indigo-500 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                  Evidence Model
                </h3>
                <p className="text-sm uppercase font-medium text-indigo-600 mb-3">
                  What analyses connect data to claims?
                </p>
                <p className="text-gray-700">
                  Describes the analyses used to relate the data participants produce
                  to claims in the student model. It uses{" "}
                  <strong>Learning Analytics</strong> (trace data, keystrokes, mouse
                  moves) and <strong>Epistemic Network Analysis (ENA)</strong> to
                  model collaborative processes and provide feedback representations
                  to educators.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          {/* --- 5. METHODOLOGY & WORK PACKAGES --- */}
          <section id="methodology" className="py-8 scroll-mt-20">
            <h2 className="text-3xl font-bold text-teal-700 mb-6">
              🛠️ Methodology &amp; Work Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-5xl mb-6">
              The 36-month roadmap involves four interconnected Work Packages (WPs)
              that iteratively develop the framework, system, and data analytic
              techniques.
            </p>

            {/* Timeline / badges */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg mb-8">
              <h3 className="text-xl font-semibold text-teal-800 mb-3">
                Project Timeline &amp; Structure (Fig. 1)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                CDx: Co-design sessions; LSx: Comparative Lab Studies; FS: Field Study;
                DEV: Development; LAD: Learning Analytics Development.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-green-100 border border-green-300 px-3 py-1 text-green-700 font-medium">
                  Year 1: CD1 &amp; LS1 (Foundations)
                </span>
                <span className="rounded-full bg-yellow-100 border border-yellow-300 px-3 py-1 text-yellow-700 font-medium">
                  Year 2: CD2 &amp; LS2 (Refinement)
                </span>
                <span className="rounded-full bg-blue-100 border border-blue-300 px-3 py-1 text-blue-700 font-medium">
                  Year 3: CD3 &amp; FS (Deployment)
                </span>
              </div>
            </div>

            {/* WP cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* WP1 */}
              <div className="rounded-xl border border-teal-300 bg-teal-50 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-teal-800">WP1: Co-design</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Focus: <strong>Assessment &amp; feedback design</strong>. Three
                  co-design sessions with educators and students (n ≈ 16 per session)
                  will prototype student, task, and feedback models.
                </p>
              </div>

              {/* WP2 */}
              <div className="rounded-xl border border-teal-300 bg-teal-50 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-teal-800">WP2: Lab Studies</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Focus: <strong>Controlled comparisons</strong>. Two lab studies
                  (LS1, LS2) with treatment (GAI) and control (non-GAI) conditions
                  (n ≈ 128 each) will compare written product quality and writing
                  processes.
                </p>
              </div>

              {/* WP3 */}
              <div className="rounded-xl border border-teal-300 bg-teal-50 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-teal-800">WP3: Field Study</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Focus: <strong>Real-classroom deployment</strong>. The final
                  GAI-enhanced system will be deployed in IT and Law courses (n ≈ 160)
                  to test the <strong>ecological validity</strong> of the framework.
                </p>
              </div>

              {/* WP4 */}
              <div className="rounded-xl border border-teal-300 bg-teal-50 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-teal-800">
                  WP4: Learning Analytics
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Focus: <strong>Analytics backbone</strong>. This includes{" "}
                  <strong>GAI fine-tuning</strong> for IT/Law, training classifiers
                  for <strong>SR-WMS</strong> processes, automated scoring, and{" "}
                  <strong>ENA-based models</strong> of writing processes.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          {/* --- 6. TEAM & IMPACT --- */}
          <section id="team" className="py-8 scroll-mt-20">
            <h2 className="text-3xl font-bold text-purple-700 mb-6">
              🧑‍🔬 Project Team &amp; Impact
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Team & Capability */}
              <div className="bg-white p-6 rounded-xl border border-purple-300 shadow-md">
                <h3 className="text-xl font-semibold text-purple-800 mb-3">
                  World-Class Team &amp; Capability
                </h3>
                <p className="text-gray-700 mb-4">
                  The team brings productive collaborations across learning analytics,
                  self-regulated learning, assessment, educational technology, and AI.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside ml-4">
                  <li>
                    <strong>Chief Investigators:</strong> Prof. Gašević, Dr. Swiecki,
                    Dr. Raković, Dr. Tsai, Dr. Rong, and Assoc. Prof. Nagtzaam.
                  </li>
                  <li>
                    <strong>International PIs:</strong> Prof. Jelena Jovanović and
                    Prof. Sanna Järvelä.
                  </li>
                  <li>
                    <strong>Institutional context:</strong> Active collaboration in
                    the Centre for Learning Analytics at Monash (CoLAM), the largest
                    centre of its kind in the world.
                  </li>
                  <li>
                    <strong>Oversight:</strong> An international Advisory Board
                    including experts in evidence-centred design and quantitative
                    ethnography.
                  </li>
                </ul>
              </div>

              {/* Policy & Societal Impact */}
              <div className="bg-white p-6 rounded-xl border border-purple-300 shadow-md">
                <h3 className="text-xl font-semibold text-purple-800 mb-3">
                  Policy &amp; Societal Impact
                </h3>
                <p className="text-gray-700 mb-4">
                  Our work aligns with Australia&apos;s national priorities and delivers
                  tangible benefits to the education sector.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside ml-4">
                  <li>
                    <strong>National priorities:</strong> Contributes to the DISR
                    Artificial Intelligence Action Plan and the Digital Economy
                    Strategy by developing <strong>trustworthy methods</strong> for
                    assessing human–AI interactions.
                  </li>
                  <li>
                    <strong>Industry:</strong> Project{" "}
                    <strong>software technologies will be open source</strong>,
                    providing blueprints for the EdTech industry to develop
                    next-generation assessment products.
                  </li>
                  <li>
                    <strong>Policy:</strong> Creates and validates{" "}
                    <strong>at-scale evidence</strong> to sharpen and renew higher
                    education policy regarding GAI use.
                  </li>
                  <li>
                    <strong>Dissemination:</strong> Results will be shared through top
                    journals and conferences, and via the Media Centre for Education
                    Research Australia (MCERA).
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="flex gap-6 pt-8 pb-4 items-center justify-center text-sm text-gray-500 h-20">
        ARC Discovery Project (DP24) · Monash University · Centre for Learning Analytics at Monash (CoLAM)
      </footer>
    </>
    // </div>
  );
}
