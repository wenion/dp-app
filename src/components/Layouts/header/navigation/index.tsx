"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const TABS = [
  { id: "", label: "About" },
  { id: "work", label: "Work Packages" },
  { id: "team", label: "Team" },
  { id: "download", label: "Download" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-2">
        {TABS.map((tab) => {
          const href = `/${tab.id}`;

          const isActive =
            tab.id === ""
              ? pathname === "/"
              : pathname === href;

          return (
            <NavigationMenuItem key={tab.id}>
              <NavigationMenuLink
                asChild
                className={[
                  navigationMenuTriggerStyle(),
                  "font-medium",
                  isActive
                    ? "border-b-2 border-sky-600 bg-sky-100 text-sky-900"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <Link href={href}>
                  {tab.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
