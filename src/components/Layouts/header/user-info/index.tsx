"use client";

import { useState } from "react";
import Image from "next/image";
import {
    LogOut as LogOutIcon,
    SettingsIcon,
    User as UserIcon,
    ChevronUp as ChevronUpIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { signout } from "@/utils/supabase/action";

export function UserInfo({
  image,
  name,
  email,
}: {
  image?: string;
  name?: string;
  email?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <figure className="flex items-center content-center gap-3">
          {image && (
            <div className="relative h-10 w-10">
              <Image
                src={image}
                alt="User Avatar"
                fill
                className="rounded-full object-cover"
                sizes="40px"
              />
            </div>
          )}
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {/* <img src={session?.user?.image!} alt="User Avatar" className="h-10 w-10 rounded-full" /> */}

          <figcaption className="space-y-1 text-base font-medium">

            <div className="leading-none text-gray-6">{email}</div>
          </figcaption>
        </figure>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2 text-base cursor-pointer text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
            <UserIcon />
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem className="p-2 text-base cursor-pointer text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
            <SettingsIcon />
            Account Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="p-2 text-base cursor-pointer text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer"
          onClick={signout}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
