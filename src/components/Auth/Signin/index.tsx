"use client";

import Link from "next/link";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";
import classNames from "classnames";

export default function Signin() {
  return (
    <>
      <p className="text-xl font-bold py-4">Sign in</p>
      <GoogleSigninButton text="Sign in" />
      <div
        className={classNames(
          "my-6 flex items-center justify-center bg-white cursor-pointer",
        )}
      >
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="flex rounded-full border w-8 h-8 justify-center bg-white">
          <span>or</span>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    <p className="text-xl font-bold py-4">Use your email</p>
      <div>
        <SigninWithPassword />
      </div>
      <div className="mt-6 text-center">
        <p>
          Don’t have any account?{" "}
          <Link href="/auth/sign-up" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}
