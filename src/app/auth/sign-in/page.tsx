import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="flex  items-center justify-center min-h-screen">

      <div className="rounded-[10px] w-1/4  bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
            <div className=" p-4 sm:p-12.5 xl:p-15">
                <div className="flex justify-center mb-6">
        <img
          src="/images/user/logo.png"        // <-- Replace with your logo path
          alt="Logo"
          className="h-18 w-auto rounded-full"
        />
      </div>

      {/* TITLE */}
      <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Sign In
      </h2>
              <Signin />
            </div>

      </div>
    </div>
  );
}
