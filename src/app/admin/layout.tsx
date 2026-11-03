import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

import { AdminNavigation } from "./admin-navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Authenticate user
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 2. Check admin role
  let isAdmin = false;

  if (!error && user) {
    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Failed to verify admin role:",
        profileError,
      );
    }

    isAdmin = !profileError && profile?.role === "admin";
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <NextTopLoader
        color="#5750F1"
        showSpinner={false}
      />

      <Header />

      {isAdmin && <AdminNavigation />}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isAdmin ? (
          children
        ) : (
          <div className="flex flex-1 items-center justify-center bg-white px-6">
            <div className="flex max-w-md flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <ShieldAlert
                  size={30}
                  className="text-red-500"
                />
              </div>

              <h2 className="text-xl font-semibold text-gray-800">
                Access Denied
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                You don&apos;t have permission to access this page.
                Please contact an administrator if you believe
                this is a mistake.
              </p>

              <Link
                href="/"
                className="mt-6 cursor-pointer rounded-lg bg-sky-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}