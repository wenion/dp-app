"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppContext } from "../context";
import { Navigation } from "./navigation";
import { Icon } from "./icons";
import { UserInfo } from "./user-info";

export function Header() {
  const { session } = useAppContext();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-30 w-full border-b border-stroke bg-white shadow-1 dark:border-stroke-dark dark:bg-gray-dark">
      {/* Main header */}
      <div className="flex items-center justify-between px-4 py-3 md:px-5 2xl:px-10">
        {/* Logo + title */}
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="shrink-0">
            <Icon />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="hidden text-xs font-semibold tracking-[0.25em] text-gray-500 uppercase sm:block">
              DP24 · ARC Discovery Project
            </span>

            <div className="truncate text-base font-bold text-slate-800 sm:text-lg md:text-xl dark:text-white">
              Assessment for Writing with{" "}
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
                Generative AI
              </span>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden shrink-0 items-center gap-6 lg:flex">
          <Navigation />

          {userName ? (
            <UserInfo
              name={userName}
              email={email}
              image={avatarUrl}
            />
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

        {/* Mobile / tablet */}
        <div className="ml-3 flex shrink-0 items-center gap-2 lg:hidden">
          {userName && (
            <UserInfo
              name={userName}
              email={email}
              image={avatarUrl}
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-stroke px-4 py-4 lg:hidden dark:border-stroke-dark">
          <Navigation />

          {!userName && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setMenuOpen(false);
                router.push("/login");
              }}
            >
              Login
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
