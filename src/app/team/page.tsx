"use client";

export default function Home() {
  return (
    <>
      <div className="bg-white flex flex-col flex-1 w-full transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="flex flex-col py-6 px-16 text-base mt-auto mb-auto">
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-sky-700">Project Team</h2>

            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                <div className="flex items-start gap-5">
                  {/* Portrait */}
                  <img
                    loading="lazy"
                    src="https://scholar.googleusercontent.com/citations?view_op=view_photo&user=HSdHD5UAAAAJ&citpid=4"
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
                    alt="Zachari Swiecki"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/no-portrait.png";
                    }}
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">
                      Project Lead
                    </p>

                    <p className="text-lg font-bold text-sky-800 leading-tight">
                      Dr Zachari Swiecki
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-prose">
                      My work focuses on advancing our understanding of collaborative
                      processes using computational methods including network analyses and
                      simulations. Contexts include human/human collaboration and human/AI
                      collaboration, particularly those contexts where learning is
                      theorised to happen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                <div className="flex items-start gap-5">
                  {/* Portrait */}
                  <img
                    loading="lazy"
                    src="https://scholar.googleusercontent.com/citations?view_op=view_photo&user=Q4Nm22sAAAAJ&citpid=3"
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
                    alt="Zachari Swiecki"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/no-portrait.png";
                    }}
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">
                      Chief Investigator
                    </p>

                    <p className="text-lg font-bold text-sky-800 leading-tight">
                      Prof Dragan Gasevic
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-prose">
                      My research in learning analytics harnesses large-scale data from
                      learners' interactions with digital technologies to advance
                      understanding of learning. I develop data science, AI, and design
                      methods, as well as unobtrusive data collection techniques, to model
                      self-regulated and collaborative learning as dynamic, fine-grained
                      processes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                <div className="flex items-start gap-5">
                  {/* Portrait */}
                  <img
                    loading="lazy"
                    src="https://scholar.googleusercontent.com/citations?view_op=view_photo&user=AfzuNksAAAAJ&citpid=2"
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
                    alt="Zachari Swiecki"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/no-portrait.png";
                    }}
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">
                      Chief Investigator
                    </p>

                    <p className="text-lg font-bold text-sky-800 leading-tight">
                      Dr Yi-Shan Tsai
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-prose">
                      I am an educational researcher with great passion to understand how
                      people construct meanings in their interactions with the world, and
                      to enhance human learning using rigorous and creative research methods.
                      My research interests range from learning analytics, feedback practice,
                      and digital storytelling to reading cultures, children's literature,
                      and multimodal texts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                <div className="flex items-start gap-5">
                  {/* Portrait */}
                  <img
                    loading="lazy"
                    src="https://scholar.googleusercontent.com/citations?view_op=view_photo&user=ysx8wHgAAAAJ&citpid=5"
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
                    alt="Zachari Swiecki"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/no-portrait.png";
                    }}
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">
                      Chief Investigator
                    </p>

                    <p className="text-lg font-bold text-sky-800 leading-tight">
                      Dr Jia (Jackie) Rong
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-prose">
                      My research spans machine learning, deep learning, bio-signal and image
                      processing, with applications in digital health, medical imaging, cancer
                      diagnosis, and cardiac disease detection, and she serves on the editorial
                      board of Scientific Reports and program committees for top-tier AI
                      conferences including AAAI, IJCAI, and PRICAI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                <div className="flex items-start gap-5">
                  {/* Portrait */}
                  <img
                    loading="lazy"
                    src="https://scholar.googleusercontent.com/citations?view_op=view_photo&user=elflddwAAAAJ&citpid=2"
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
                    alt="Zachari Swiecki"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/no-portrait.png";
                    }}
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">
                      Chief Investigator
                    </p>

                    <p className="text-lg font-bold text-sky-800 leading-tight">
                      Dr Mladen Raković
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-prose">
                      I use learning analytics and artificial intelligence to study how
                      students self-regulate learning in complex reading and writing
                      tasks, and to design technology-enhanced environments that deliver
                      automated, personalised support.
                    </p>
                  </div>
                </div>
              </div>
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
