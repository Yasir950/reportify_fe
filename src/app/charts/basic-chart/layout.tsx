"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartsData() {
  const [status, setStatus] = useState("Education");
  const [xAxis, setXAxis] = useState("Date");
  const [chartType, setChartType] = useState<"line" | "bar" | "pie" | "donut" | "area">("line");
  const [isDark, setIsDark] = useState(false);

  const educationLevels = ["Matric", "Inter", "Bachelors", "MS", "PHD"];

  // Detect dark mode
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // State for chart data
  const [series, setSeries] = useState<any>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});

  // Automatically update chart when any selection changes
  useEffect(() => {
    // Generate some random data based on selection
    const simulatedData = [
      Math.floor(Math.random() * 100) + 20,
      Math.floor(Math.random() * 100) + 30,
      Math.floor(Math.random() * 100) + 10,
      Math.floor(Math.random() * 100) + 50,
      Math.floor(Math.random() * 100) + 40,
    ];

    const isRadial = chartType === "pie" || chartType === "donut";

    if (isRadial) {
      setSeries(simulatedData);
      setChartOptions({
        chart: { id: "basic-chart" },
        labels: educationLevels,
        theme: { mode: isDark ? "dark" : "light" },
        legend: { 
          position: "bottom",
          labels: { colors: isDark ? "#fff" : "#000" } 
        },
      });
    } else {
      setSeries([{ name: status, data: simulatedData }]);
      setChartOptions({
        chart: { 
          id: "basic-chart",
          toolbar: { show: true }
        },
        theme: { mode: isDark ? "dark" : "light" },
        xaxis: {
          categories: educationLevels,
          title: { text: xAxis, style: { color: isDark ? "#fff" : "#000" } },
          labels: { style: { colors: isDark ? "#fff" : "#000" } },
        },
        yaxis: {
          labels: { 
            style: { colors: isDark ? "#fff" : "#000" },
            formatter: (val: number) => `${val}%`
          },
          title: { text: "Percentage", style: { color: isDark ? "#fff" : "#000" } },
        },
        stroke: { curve: "smooth" },
      });
    }
  }, [status, xAxis, chartType, isDark]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Controls Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
            <option value="Health">Health</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">X-Axis Label</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full p-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Date">Date</option>
            <option value="Month">Month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="w-full p-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="donut">Donut Chart</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-tight">
            {status} Trends
          </h2>
          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
            Mode: {chartType.toUpperCase()}
          </div>
        </div>

        {/* The key prop here is essential for switching chart types correctly */}
        <Chart 
          key={chartType} 
          options={chartOptions} 
          series={series} 
          type={chartType} 
          height={400} 
        />
      </div>
    </div>
  );
}