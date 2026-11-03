"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Settings2,
  Users,
  ShieldBan,
} from "lucide-react";

const ADMIN_MODULES = [
  {
    title: "Mutation Configs",
    description:
      "Manage DOM selectors for supported AI platforms.",
    href: "/admin/mutation-configs",
    icon: Settings2,
  },
  {
    title: "Profiles",
    description:
      "View user profiles, roles, sessions, and trace counts.",
    href: "/admin/profiles",
    icon: Users,
  },
  {
    title: "Site Blacklist",
    description:
      "Manage websites that are permanently excluded from recording.",
    href: "/admin/site-blacklist",
    icon: ShieldBan,
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-16">
        <section className="space-y-6">

          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-sky-700">
              Admin Dashboard
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage system settings and configurations.
            </p>
          </div>

          {/* Modules */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ADMIN_MODULES.map((module) => {
              const Icon = module.icon;

              return (
                <button
                  key={module.href}
                  type="button"
                  onClick={() => router.push(module.href)}
                  className="group flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:border-sky-500/50 hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="flex w-full items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <Icon size={22} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-gray-300 transition-colors group-hover:text-sky-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-5">
                    <h3 className="text-base font-semibold text-sky-800">
                      {module.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {module.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center gap-2 text-xs font-medium text-sky-700">
                    {module.title === "Profiles"
                        ? "View profiles"
                        : "Manage configurations"}

                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </button>
              );
            })}
          </div>

        </section>
      </main>
    </div>
  );
}