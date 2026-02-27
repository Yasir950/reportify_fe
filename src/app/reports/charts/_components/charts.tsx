"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartsData() {
  const [status, setStatus] = useState("Education");
  const [xAxis, setXAxis] = useState("Date");
  // Casting the string to the specific union type ApexCharts expects
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "pie" | "donut">("line");
  const [isDark, setIsDark] = useState(false);

  const educationLevels = ["Matric", "Inter", "Bachelors", "MS", "PHD"];

  // 1. Properly typed States
  // This allows the series to be either [{name, data}] OR [number, number]
  const [series, setSeries] = useState<ApexAxisChartSeries | ApexNonAxisChartSeries>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    chart: { id: "dynamic-chart" },
    xaxis: { categories: educationLevels },
    theme: { mode: "light" },
  });

  // 2. Detect Dark Mode
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // 3. Reactive Update Logic
  useEffect(() => {
    const rawData = [30, 40, 45, 50, 49].map(n => n + Math.floor(Math.random() * 20));
    const isRadial = chartType === "pie" || chartType === "donut";

    if (isRadial) {
      // For Pie/Donut, series must be a simple number array
      setSeries(rawData);
      setChartOptions({
        chart: { id: "dynamic-chart" },
        labels: educationLevels,
        theme: { mode: isDark ? "dark" : "light" },
        legend: { 
          position: 'bottom', 
          labels: { colors: isDark ? "#fff" : "#000" } 
        }
      });
    } else {
      // For Line/Bar/Area, series must be an array of objects
      setSeries([{ name: status, data: rawData }]);
      setChartOptions({
        chart: { id: "dynamic-chart" },
        xaxis: { 
          categories: educationLevels,
          title: { text: xAxis, style: { color: isDark ? "#fff" : "#000" } },
          labels: { style: { colors: isDark ? "#fff" : "#000" } } 
        },
        yaxis: {
          labels: { style: { colors: isDark ? "#fff" : "#000" } }
        },
        theme: { mode: isDark ? "dark" : "light" },
        stroke: { curve: "smooth" }
      });
    }
  }, [status, xAxis, chartType, isDark]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        
        {/* Category Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
            <option value="Health">Health</option>
          </select>
        </div>

        {/* X-Axis Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">X-Axis Label</label>
          <select 
            value={xAxis} 
            onChange={(e) => setXAxis(e.target.value)} 
            className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Date">Date</option>
            <option value="Month">Month</option>
            <option value="Level">Level</option>
          </select>
        </div>

        {/* Chart Type Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-blue-600 dark:text-blue-400">Visual Type</label>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as any)} 
            className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50 dark:bg-gray-700 dark:text-white dark:border-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="donut">Donut Chart</option>
          </select>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wide">
            {status} Analysis
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs font-bold rounded-full uppercase">
            {chartType}
          </span>
        </div>
        
        {/* 'key' forces re-mount when type changes to prevent scale calculation bugs */}
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