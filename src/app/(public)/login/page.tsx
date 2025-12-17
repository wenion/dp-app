"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import GoogleSigninButton from "@/components/Auth/GoogleSigninButton";
import SigninWithPassword from "@/components/Auth/SigninWithPassword";
import { useAppContext } from "@/components/Layouts/context";

export default function LoginPage() {
  const { session } = useAppContext();
  const sp = useSearchParams();
  const router = useRouter();

  const from = sp.get("from");
  const ext = sp.get("ext");

  const next = from === "extension"
    ? `/settings/integrations?from=extension&ext=${encodeURIComponent(ext ?? "")}`
    : "/";

  useEffect(() => {
    if (session) {
      router.replace(next);
    }
  }, [router, session, next]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-[525px]">
        <p className="py-4 text-xl font-bold">Sign in</p>

        <GoogleSigninButton text="Sign in" next={next} />

        <div className="my-6 flex items-center justify-center">
          <div className="flex-1 border-t" />
          <div className="mx-3 flex h-8 w-8 items-center justify-center rounded-full border">
            <span className="text-xs">or</span>
          </div>
          <div className="flex-1 border-t" />
        </div>

        <p className="py-4 text-xl font-bold">Use your email</p>
        <SigninWithPassword />

        <div className="mt-6 text-center">
          <p>
            Don’t have an account?{" "}
            <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
