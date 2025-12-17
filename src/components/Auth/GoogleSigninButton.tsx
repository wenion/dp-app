"use client";

import classnames from "classnames";

import { GoogleIcon } from "@/assets/icons";
import { useAppContext } from "../Layouts/context";

export default function GoogleSigninButton({
  text,
  next
}: {
  text: string;
  next: string
}) {
  const { signInWithGoogle } = useAppContext();

  return (
    <button
      className={classnames(
        "flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium",
        "hover:bg-slate-50 hover:bg-opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50 cursor-pointer"
      )}
      onClick={() => signInWithGoogle({ provider: "google", next: next })}
    >
      <GoogleIcon />
      {text} with Google
    </button>
  );
}
