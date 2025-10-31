"use client";

import Image from "next/image";
import { useMemo } from "react";

import { useAppContext } from "../context";
import { Navigation } from "./navigation";
import { Notification } from "./notification";
import { UserInfo } from "./user-info";

export function Header() {
  const { session } = useAppContext();

  const userName = useMemo(() => {
    if (session?.user?.email) {
      const username = session?.user?.email.split("@")[0];
      const first = username.split(/[._\s-]+/)[0];
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
  }, [session]);

  return (
    <header className="sticky top-0 z-30 flex w-full cursor-pointer items-center justify-end border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <div className="max-[850px]:hidden">
        <Image
          className="dark:invert"
          src="/trace_logo.svg"
          alt="Next.js logo"
          width={100}
          height={38}
          priority
        />
      </div>

      <div className="flex flex-1 pl-12">
        <Navigation />
      </div>
      <div className="flex flex-none gap-4">
        <Notification />
        <UserInfo name={userName} email={session?.user?.email} />
      </div>
    </header>
  );
}
