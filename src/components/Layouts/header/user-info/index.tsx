"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    LogOut as LogOutIcon,
    SettingsIcon,
    User as UserIcon,
    ChevronUp as ChevronUpIcon,
} from "lucide-react";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const USER = {
    name: "Jim",
    email: "jim.wen@monash.edu",
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <figure className="flex items-center content-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{USER.name}</span>

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
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {USER.name}
            </div>

            <div className="leading-none text-gray-6">{USER.email}</div>
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

        <DropdownMenuItem className="p-2 text-base cursor-pointer text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
