import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import type { Metadata } from "next";
import { SignInForm } from "./_components/sign-in-form";
import { SignUpForm } from "./_components/sign-up-form";
import ChartsData from "./_components/charts";

export const metadata: Metadata = {
  title: "Chart Report",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Chart Report" />

       <ChartsData/>
    </>
  );
}
