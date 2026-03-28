"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { masoolService } from "@/services/masoolService";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartsData() {
  const [month, setMonth] = useState("1");
  const [level, setLevel] = useState("provinces");
  const [status, setStatus] = useState("activities");
  const [reportData, setReportData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "pie" | "donut">("bar");

  useEffect(() => {
    masoolService.fetchMasoolReport(month, level, status)
      .then((data) => setReportData(Array.isArray(data) ? data : []))
      .catch(() => setReportData([]));
  }, [month, level, status]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    reportData.forEach((loc) => {
      let val = "";
      if (status === "activities") val = loc.activity ;
      else if (status === "education") val = loc.education_level ;
      else if (status === "skill") val = loc.skills_level ;
      else if (status === "ideology") val = loc.ideological_status ;
      else if (status === "active") val = `Level ${loc.active_status}`;
      else if (status === "age") {
        const age = parseInt(loc.age);
        if (age <= 12) val = "7-12";
        else if (age <= 17) val = "13-17";
        else if (age <= 25) val = "18-25";
        else val = "25+";
      }
      counts[val] = (counts[val] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      values: Object.values(counts),
    };
  }, [reportData, status]);

  const isRadial = chartType === "pie" || chartType === "donut";
  
  const series: ApexAxisChartSeries | ApexNonAxisChartSeries = isRadial 
    ? chartData.values 
    : [{ name: "Total Count", data: chartData.values }];

  const options: ApexOptions = {
    chart: { 
      id: "masool-charts", 
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif" // Cleaner font stack
    },
    labels: chartData.labels,
    xaxis: { 
      categories: isRadial ? [] : chartData.labels,
      labels: { 
        style: { 
          colors: "#334155", // Darker slate for better legibility
          fontSize: '12px',
          fontWeight: 500 
        } 
      }
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: '12px' }
      }
    },
    // High-contrast colors
    colors: ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#db2777"],
    plotOptions: {
      bar: { borderRadius: 6, distributed: true, columnWidth: '60%' }
    },
    legend: { 
      position: "bottom",
      fontSize: '13px',
      fontWeight: 500,
      labels: { colors: "#1e293b" },
      markers: { radius: 12 }
    },
    dataLabels: { 
      enabled: true,
      style: { fontSize: '12px', fontWeight: 'bold' }
    },
    title: {
      text: `${status.charAt(0).toUpperCase() + status.slice(1)} Analytics`,
      align: "left",
      style: { color: "#0f172a", fontSize: '18px', fontWeight: 600 }
    },
    tooltip: {
        theme: 'light',
        style: { fontSize: '12px' }
    }
  };

  return (
    <div className="bg-white font-sans">
      {/* 🛠️ FILTER PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-100">
        <FilterSelect label="Status Category" value={status} onChange={setStatus}>
          <option value="activities">Activities</option>
          <option value="education">Education</option>
          <option value="age">Age Range</option>
          <option value="skill">Skills Level</option>
          <option value="ideology">Ideological Status</option>
          <option value="active">Active Status</option>
        </FilterSelect>

        <FilterSelect label="Visual Layout" value={chartType} onChange={setChartType}>
          <option value="bar">Bar Graph</option>
          <option value="pie">Pie Chart</option>
          <option value="donut">Donut Chart</option>
          <option value="line">Line Trend</option>
          <option value="area">Area Map</option>
        </FilterSelect>
      </div>

      {/* 📊 CHART DISPLAY */}
      <div className="p-8">
        {reportData.length > 0 ? (
          <div className="w-full">
            <Chart 
              key={chartType + status} 
              options={options} 
              series={series} 
              type={chartType} 
              height={400} 
            />
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-sm font-medium">No records found for this criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none shadow-sm"
      >
        {children}
      </select>
    </div>
  );
}