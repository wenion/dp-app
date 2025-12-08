"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useAppContext } from "../context";
import { Navigation } from "./navigation";
import { Notification } from "./notification";
import { UserInfo } from "./user-info";

export function Header() {
  const { session } = useAppContext();
  const [hovered, setHovered] = useState(false);

  const userName = useMemo(() => {
    if (session?.user?.email) {
      const username = session?.user?.email.split("@")[0];
      const first = username.split(/[._\s-]+/)[0];
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
  }, [session]);

  return (
    <header
      className="sticky top-0 z-30 flex justify-between w-full cursor-pointer items-center border-b border-stroke bg-white px-4 py-2 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Icon remains bright */}
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-indigo-500 shadow-xl shadow-sky-500/80 animate-pulse-slow" />
        <div className="flex flex-col">
          <span
            className={`block text-xs font-semibold tracking-[0.25em] text-gray-500 uppercase transition-all duration-300 ${
              hovered ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            DP24 · ARC Discovery Project
          </span>
          <span
            className={`block text-xl font-bold text-slate-800 transition-all duration-300 ${
              hovered ? "-translate-y-6" : "translate-y-0"
            }`}
          >
            Evidence-Centred Assessment for Writing with {" "}
            <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Generative AI
            </span>
          </span>
          <div
            className={`block max-h-2 text-xs font-semibold tracking-[0.25em] text-gray-500 uppercase transition-all duration-300 ${
              hovered ? "-translate-y-6 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <Navigation />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Notification />
        <UserInfo name={userName} email={session?.user?.email} />
      </div>
    </header>
  );
}
