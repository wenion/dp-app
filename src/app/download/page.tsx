"use client";

export default function Home() {
  return (
    <>
      <div className="bg-white flex flex-col flex-1 w-full border border-transparent transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="w-full py-10 px-4 md:px-10 2xl:px-16">
          <section className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-betwen">
              <h1 className="flex-1 text-2xl md:text-3xl font-bold text-sky-800">
                Downloads
              </h1>
              <div className="flex flex-col items-start md:items-end gap-2">
                <a
                  href="https://drive.google.com/drive/folders/1SYTz3ivWpyiNcLX__N6P4xvWzV24AsQN"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  <span>Open Google Drive Folder</span>
                  <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="flex gap-6 pt-8 pb-4 flex-wrap items-center justify-center text-xs md:text-sm text-gray-500">
        ARC Discovery Project (DP24) · Monash University
      </footer>
    </>

  );
}