"use client";

import dynamic from "next/dynamic";

// const Map = dynamic(() => import("./map"), { ssr: false });

export function RegionLabels() {
  return (
    <div className="col-span-12 rounded-[10px] bg-white  shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h2 className="p-4 text-body-2xlg font-bold text-dark dark:text-white">
        Pakistan Map
      </h2>

      {/* <Map /> */}
    </div>
  );
}
