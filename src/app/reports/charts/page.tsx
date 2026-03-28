import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import type { Metadata } from "next";
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
