"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "../context";
import { Navigation } from "./navigation";
import { Notification } from "./notification";
// import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { status } = useSession();
  const { isMobile } = useAppContext();
  const pathname = usePathname();

  const loginPath = "/login";

  return (
    <header className="sticky top-0 z-30 cursor-pointer flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      {isMobile && (
        <Link href={"/"}>
          <Image
            src={"/trace_logo.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

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

      <div className="flex flex-1 items-center pl-12 min-[375px]:pl-8 gap-2 min-[375px]:gap-4">
        {status === "authenticated" ? (
          <>
            <Navigation />
            <div className="flex flex-1 space-x-4 justify-end">
              <Notification />
              <UserInfo />
            </div>
          </>
        ): (
          <div className="flex flex-1 space-x-4 justify-end">
            {pathname !== loginPath && (
              <div className="flex flex-wrap items-center gap-2 md:flex-row">
                <Button asChild>
                  <Link href={loginPath}>Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
