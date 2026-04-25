import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DataPreviewTable from "@/components/DataPreview";
import AddActivities from "@/components/Form/activitiesForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Activities Page",
  // other metadata
};

const UploadPage = () => {
  return (
    <>
      <Breadcrumb pageName="Add Activities" />

      <AddActivities  />
    </>
  );
};

export default UploadPage;
