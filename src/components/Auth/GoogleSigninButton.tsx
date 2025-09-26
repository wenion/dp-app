"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/assets/icons";
import classnames from "classnames";

export default function GoogleSigninButton({ text }: { text: string }) {
  const { status } = useSession();
  const router = useRouter();

  const handleClick = async () => {
    if (status === "authenticated") {
      router.push("/");
    } else {
      await signIn("google");
    }
  };

  return (
    <button
      className={classnames(
        "flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium",
        "hover:bg-slate-50 hover:bg-opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50 cursor-pointer"
      )}
      onClick={handleClick}
    >
      <GoogleIcon />
      {text} with Google
    </button>
  );
}
