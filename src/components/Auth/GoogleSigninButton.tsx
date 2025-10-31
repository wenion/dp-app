"use client";

import classnames from "classnames";

import { GoogleIcon } from "@/assets/icons";
import { loginWithGoogle } from "@/utils/supabase/action";

export default function GoogleSigninButton({ text }: { text: string }) {
  return (
    <button
      className={classnames(
        "flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium",
        "hover:bg-slate-50 hover:bg-opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50 cursor-pointer"
      )}
      onClick={loginWithGoogle}
    >
      <GoogleIcon />
      {text} with Google
    </button>
  );
}
