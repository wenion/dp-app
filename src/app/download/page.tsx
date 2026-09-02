"use client";

import { EllipsisVertical } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-1 flex-col border border-transparent bg-white transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="w-full px-4 py-10 md:px-10 2xl:px-16">
          <section className="mx-auto max-w-4xl space-y-10">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-sky-800 md:text-3xl">
                  Trace Extension Guide
                </h1>

                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  Download, install, and get started with the Trace Chrome
                  Extension.
                </p>
              </div>

              <a
                href="https://drive.google.com/drive/folders/1SYTz3ivWpyiNcLX__N6P4xvWzV24AsQN"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                <span>Download Trace</span>
                <span className="text-xs">↗</span>
              </a>
            </div>

            {/* Installation */}
            <section className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
                  Installation
                </h2>

                <p className="mt-2 text-slate-600">
                  Follow the steps below to install Trace in Google Chrome.
                </p>
              </div>

              {/* Step 1 */}
              <GuideStep number="1" title="Download and Extract Trace">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Download the Trace installation package using the{" "}
                    <strong>Download Trace</strong> button above.
                  </li>

                  <li>
                    The installation package is provided as a{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-sky-800">
                      .zip
                    </code>{" "}
                    file.
                  </li>

                  <li>Unzip the downloaded file.</li>

                  <li>
                    After extracting the archive, locate the{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-semibold text-sky-800">
                      dist
                    </code>{" "}
                    folder. You will use this folder to install Trace in
                    Chrome.
                  </li>
                </ol>
              </GuideStep>

              {/* Step 2 */}
              <GuideStep number="2" title="Open Chrome Extensions">
                <p>Open Google Chrome and navigate to:</p>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                  chrome://extensions/
                </div>

                <p className="mt-4">Alternatively:</p>

                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  <li>Open Chrome.</li>
                  <li className="flex items-center gap-1">
                    Click the
                    <EllipsisVertical className="inline-block h-4 w-4" />
                    menu in the upper-right corner.
                  </li>
                  <li>
                    Select <strong>Extensions → Manage Extensions</strong>.
                  </li>
                </ol>
              </GuideStep>

              {/* Step 3 */}
              <GuideStep number="3" title="Enable Developer Mode">
                <p>
                  On the <strong>Manage Extensions</strong> page, turn on{" "}
                  <strong>Developer mode</strong> in the upper-right corner.
                </p>
              </GuideStep>

              {/* Step 4 */}
              <GuideStep number="4" title="Load the Trace Extension">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Click <strong>Load unpacked</strong>.
                  </li>

                  <li>
                    Select the{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-semibold text-sky-800">
                      dist
                    </code>{" "}
                    folder extracted from the downloaded installation package.
                  </li>

                  <li>
                    Trace should now appear on the Chrome Extensions page.
                  </li>
                </ol>
              </GuideStep>

              {/* Step 5 */}
              <GuideStep number="5" title="Pin Trace to the Chrome Toolbar">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Click the <strong>Extensions</strong> (puzzle piece) icon
                    in the Chrome toolbar.
                  </li>

                  <li>
                    Find <strong>Trace</strong>.
                  </li>

                  <li>
                    Click the <strong>Pin</strong> icon next to Trace.
                  </li>
                </ol>

                <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                  The Trace icon should now remain visible in your Chrome
                  toolbar.
                </div>
              </GuideStep>
            </section>

            {/* Using Trace */}
            <section className="space-y-8 border-t border-slate-200 pt-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
                  Using Trace
                </h2>

                <p className="mt-2 text-slate-600">
                  Once Trace is installed, follow these steps to sign in and
                  start using the extension.
                </p>
              </div>

              {/* Step 1 */}
              <GuideStep number="1" title="Sign In">
                <p className="mb-3">
                  Before using Trace for the first time:
                </p>

                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    <strong>Right-click</strong> the Trace icon in the Chrome
                    toolbar.
                  </li>

                  <li>
                    Click <strong>Sign in</strong>.
                  </li>

                  <li>
                    Follow the sign-in instructions to complete
                    authentication.
                  </li>
                </ol>

                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Once you have successfully signed in, the{" "}
                  <strong>AUTH</strong> indicator on the Trace icon will
                  disappear. Trace is then authenticated and ready to use.
                </div>
              </GuideStep>

              {/* Step 2 */}
              <GuideStep number="2" title="Open Trace">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Navigate to the webpage where you want to use Trace.
                  </li>

                  <li>
                    Click the <strong>Trace</strong> icon in the Chrome
                    toolbar to open the extension.
                  </li>
                </ol>
              </GuideStep>
            </section>
          </section>
        </main>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-6 px-4 pt-8 pb-4 text-center text-xs text-gray-500 md:text-sm">
        ARC Discovery Project (DP24) · Monash University
      </footer>
    </>
  );
}

function GuideStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      {/* Step number */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
        {number}
      </div>

      {/* Step content */}
      <div className="min-w-0 flex-1">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">
          {title}
        </h3>

        <div className="leading-7 text-slate-600">{children}</div>
      </div>
    </div>
  );
}