import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MapWrapper from "./MapWrapper"; // Import the new wrapper

export const metadata: Metadata = {
  title: "Map Report",
};

export default function FormElementsPage() {
  return (
    <>
      {/* <Breadcrumb pageName="Map Report" /> */}
      {/* The wrapper handles the client-side loading safely */}
      <MapWrapper />
    </>
  );
}