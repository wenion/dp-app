"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAppContext } from "../context";
import { Navigation } from "./navigation";
import { Notification } from "./notification";
import { Icon } from "./icons";
import { UserInfo } from "./user-info";

export function Header() {
  const { session } = useAppContext();
  const router = useRouter();

  const [hovered, setHovered] = useState(false);

  const userName = useMemo(() => {
    return session?.user?.identities?.[0]?.identity_data?.name || null;
  }, [session]);

  const email = useMemo(() => {
    return session?.user?.identities?.[0]?.identity_data?.email || null;
  }, [session]);

  const avatarUrl = useMemo(() => {
    return session?.user?.identities?.[0]?.identity_data?.avatar_url || null;
  }, [session]);

  return (
    <header
      className="sticky top-0 z-30 flex w-full cursor-pointer items-center justify-between border-b border-stroke bg-white px-4 py-2 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Icon remains bright */}
        <Icon />
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
            Assessment for Writing with {" "}
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
        { userName ? (
          <>
            {/* <Notification /> */}
            <UserInfo
              name={userName}
              email={email}
              image={avatarUrl}
            />
          </>
        ) : (
          <Button
            variant="outline"
            aria-label="Login"
            className="cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
