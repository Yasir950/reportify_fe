"use client"; // This is the key!

import dynamic from "next/dynamic";

// Dynamically import the actual map logic
const MapContent = dynamic(() => import("./map-page"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-xl border border-gray-200 bg-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent"></div>
    </div>
  )
});

export default function MapWrapper() {
  return <MapContent />;
}