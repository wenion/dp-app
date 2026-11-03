"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AdminNavigation() {
  const pathname = usePathname();

  if (pathname === "/admin") {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-3 md:px-16">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-sky-700"
      >
        <ArrowLeft size={16} />
        Back to Admin
      </Link>
    </div>
  );
}