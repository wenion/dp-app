"use client";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center bg-gray-100 text-slate-900 h-screen">
      <div className="bg-white flex flex-col w-full max-w-7xl transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="flex py-6 px-16 text-base pt-20 pb-40">
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-sky-700">Project Team 🧑‍🔬</h2>
            <p className="text-sm text-gray-600">
              A multi-disciplinary team spanning learning analytics, law, AI, and the
              learning sciences.
            </p>

            <div className="grid gap-4 md:grid-cols-3 text-sm">

              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-1 border-b border-gray-200 pb-1">
                  Project Lead
                </p>
                <p className="text-base font-bold text-sky-800">
                  Dr Zachari Swiecki
                </p>
                <p className="mt-2 text-gray-600">
                </p>
              </div>

              <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-1 border-b border-gray-200 pb-1">
                  Professor
                </p>
                <p className="text-base font-bold text-sky-800">Prof. Dragan Gašević</p>
                <p className="mt-2 text-gray-600">
                  
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