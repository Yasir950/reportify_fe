import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DataPreviewTable from "@/components/DataPreview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload File Page",
  // other metadata
};

const UploadPage = () => {
  return (
    <>
      <Breadcrumb pageName="Upload File" />

      <DataPreviewTable  />
    </>
  );
};

export default UploadPage;
