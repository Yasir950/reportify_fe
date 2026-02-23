"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartsData() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("Education");
  const [xAxis, setXAxis] = useState("Date");

  const educationLevels = ["Matric", "Inter", "Bachelors", "MS", "PHD"];

  // detect dark mode from document (Tailwind class)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const [series, setSeries] = useState([
    {
      name: "My Dataset",
      data: [0, 0, 0, 0, 0],
    },
  ]);

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "line",
      height: 400,
      toolbar: { show: true },
    },
    theme: { mode: "light" },
    xaxis: {
      categories: ["Feb 2026", "Mar 2026"],
      title: { text: xAxis },
      labels: { style: { colors: "#000" } },
    },
    yaxis: {
      categories: educationLevels,
      labels: {
        formatter: (val, index) => educationLevels[index],
        style: { colors: "#000" },
      },
      title: { text: "Value" },
    },
    stroke: { curve: "smooth" },
    tooltip: { shared: true },
  });

  // update theme when dark mode changes
  useEffect(() => {
    setChartOptions((prev) => ({
      ...prev,
      theme: { mode: isDark ? "dark" : "light" },
      xaxis: {
        ...prev.xaxis,
        labels: { style: { colors: isDark ? "#fff" : "#000" } },
      },
      yaxis: {
        ...prev.yaxis,
        labels: { 
          formatter: (val, index) => educationLevels[index],
          style: { colors: isDark ? "#fff" : "#000" },
        },
      },
    }));
  }, [isDark]);

  const handleSearch = () => {
    const simulatedData = [1, 2, 3, 4, 5];

    setSeries([{ name: status, data: simulatedData }]);

    setChartOptions((prev) => ({
      ...prev,
      xaxis: { ...prev.xaxis, title: { text: xAxis } },
    }));
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block mb-1 text-gray-900 dark:text-gray-300">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-900 dark:text-gray-300">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-900 dark:text-gray-300">Choose Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
            <option value="Health">Health</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-900 dark:text-gray-300">X-axis</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="Date">Date</option>
            <option value="Month">Month</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <Chart options={chartOptions} series={series} type="line" height={400} />
      </div>
    </div>
  );
}
