import Signin from "@/components/Auth/Signin";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <>
      {/* <Breadcrumb pageName="Sign In" /> */}

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-wrap justify-center items-center">
          <div className="w-full pt-6 w-lg max-w-[525px]">
            <div className="w-full py-4 sm:p-12.5 xl:py-15">
              <Signin />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
