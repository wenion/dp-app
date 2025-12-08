"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState<string>("about");

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-2">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <NavigationMenuItem key={tab.id}>
              <NavigationMenuLink
                asChild
                onClick={() => setActiveTab(tab.id)}
                className={[
                  navigationMenuTriggerStyle(),
                  isActive
                    ? "bg-sky-100 text-sky-800 border-b-2 border-sky-600"
                    : "text-gray-500 hover:text-slate-800 hover:bg-gray-100",
                ].join(" ")}
              >
                <Link href={`/${tab.id}`}>{tab.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
