"use client";

import { activitiesService } from "@/services/activitiesService";
import { useEffect, useState } from "react";

export default function AddActivities() {
  const [month, setMonth] = useState<number | "">("");
  const [year] = useState(2026);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any | null>(null);

const activitiesList = [
  "Workshop",
  "Session",
  "Prayer",
  "Quiz",
  "Ceremony",
  "Occasional Program",
  "Meeting",
  "Visits",
  "Class",
  "Workshop Training",
  "Rally",
  "Program",
  "Camp",
];

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const saveActivities = async () => {
    if (!month) return alert("Select month");

    const data = await activitiesService.saveActivities(
      Number(month),
      year,
      selectedActivities
    );

    if (data.result) {
      alert("Activities saved!");
      fetchActivities();
    }
  };

  const fetchActivities = async () => {
    if (!month) return;

    const data = await activitiesService.getActivities(Number(month), year);

    if (data.result) {
      setTableData(data.data);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [month]);

  const monthName = (m: number) =>
    new Date(0, m - 1).toLocaleString("en", { month: "long" });

  return (
    <div className="p-10">

    
      {/* Month Selector */}
      <div className="mb-6">
        <label className="block font-medium text-gray-700 mb-1">
          Select Month
        </label>

        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="w-64 p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {monthName(i + 1)}
            </option>
          ))}
        </select>
      </div>

      {/* Activities */}
      <div className="mb-6">
        <label className="block font-medium text-gray-700 mb-2">
          Activities
        </label>

        {/* Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          {activitiesList.map((activity) => (
            <label
              key={activity}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedActivities.includes(activity)}
                onChange={() => toggleActivity(activity)}
                className="accent-green-600"
              />
              <span>{activity}</span>
            </label>
          ))}

        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveActivities}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Save Activities
      </button>

      {/* Table */}
    {/* Pretty Table */}
{tableData && (
  <div className="mt-10 w-full max-w-3xl">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">Monthly Activities</h3>

    <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
      <thead className="bg-green-600 text-white">
        <tr>
          <th className="p-3 text-left">#</th>
          <th className="p-3 text-left">Month - Year</th>
          <th className="p-3 text-left">Activities</th>
        </tr>
      </thead>

      <tbody className="bg-white">
        <tr className="border-b hover:bg-gray-100 transition">
          <td className="p-3 font-medium">1</td>
          <td className="p-3">
            {monthName(tableData.month)} - {tableData.year}
          </td>
          <td className="p-3 text-gray-700">
            {tableData.activities?.join(", ")}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}
    </div>
  );
}