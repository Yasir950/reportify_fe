"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, GeoJSON, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { masoolService } from "@/services/masoolService";
import { activitiesService } from "@/services/activitiesService";

// --- 1. Constant Configuration ---
const ACTIVITY_CONFIG: Record<string, string> = {
  "Workshop": "#ef4444",
  "Session": "#f59e0b",
  "Prayer": "#3b82f6",
  "Quiz": "#10b981",
  "Ceremony": "#8b5cf6",
  "Occasional Program": "#ec4899",
  "Meeting": "#7b0827",
  "Visits": "#0ea5e9",
  "Class": "#eab308",
  "Workshop Training": "#f97316",
  "Rally": "#6366f1",
  "Program": "#06b6d4",
  "Camp": "#a855f7",
};

// --- 2. Helper function for Battery Icon ---
// --- Updated Helper function for Battery Icon ---
const getPinnedBatteryHtml = (status: string, data: any, allowedActivities: string[]) => {
  let cellsCount = 0;
  let activeColors: string[] = [];
  // 1. Initialize maxCells with a default
  let maxCells = status === "age" ? 4 : 5; 
  let cellHoverValues: string[] = [];

  switch (status) {
    case "activities": {
      const userActsRaw = String(data.activities || "").split(",").map((a) => a.trim()).filter(Boolean);
      const allowedLower = Array.isArray(allowedActivities) ? allowedActivities.map(a => a.toLowerCase()) : [];
      
      // 2. Dynamic Cell Logic: Set maxCells to the actual count if it's > 5
      cellsCount = userActsRaw.length;
      maxCells = Math.max(5, cellsCount); 
      
      cellHoverValues = userActsRaw;
      activeColors = userActsRaw.map((act) => {
        const isAllowed = allowedLower.includes(act.toLowerCase());
        if (isAllowed) {
          const configKey = Object.keys(ACTIVITY_CONFIG).find(key => key.toLowerCase() === act.toLowerCase());
          return configKey ? ACTIVITY_CONFIG[configKey] : "#3b82f6";
        }
        return "#000000"; 
      });
      break;
    }

    case "education":
      cellHoverValues = ["Primary", "Middle", "Inter", "Bachelors", "Masters/PhD"];
      activeColors = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"]; 
      const edu = String(data.education_level || "").toUpperCase();
      if (edu.includes("PHD") || edu.includes("MASTERS")) cellsCount = 5;
      else if (edu.includes("BACHELORS")) cellsCount = 4;
      else if (edu.includes("INTERMEDIATE")) cellsCount = 3;
      else if (edu.includes("MIDDLE")) cellsCount = 2;
      else cellsCount = 1;
      break;

    case "age":
      cellHoverValues = ["7-11", "12-17", "18-25", "25+"];
      activeColors = ["#fdba74", "#fb923c", "#f97316", "#ea580c"];
      const ageVal = parseInt(data.age) || 0;
      if (ageVal > 25) cellsCount = 4;
      else if (ageVal >= 18) cellsCount = 3;
      else if (ageVal >= 12) cellsCount = 2;
      else if (ageVal >= 7) cellsCount = 1;
      break;

    case "skill":
    case "ideology": {
      const levelVal = status === "skill" ? data.skills_level : data.ideological_status;
      cellHoverValues = ["Mod 1", "Mod 2", "Mod 3", "Mod 4", "Mod 5"];
      activeColors = ["#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce"];
      const val = String(levelVal || "").toUpperCase();
      if (val.includes("MODULE 5")) cellsCount = 5;
      else if (val.includes("MODULE 4")) cellsCount = 4;
      else if (val.includes("MODULE 3")) cellsCount = 3;
      else if (val.includes("MODULE 2")) cellsCount = 2;
      else if (val.includes("MODULE 1")) cellsCount = 1;
      break;
    }

    case "active":
      cellHoverValues = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
      cellsCount = Math.min(parseInt(data.active_status) || 0, 5);
      activeColors = ["#4af285", "#27df6a", "#22c55e", "#16a34a", "#14532d"];
      break;
  }

  const cells = Array.from({ length: maxCells }, (_, i) => {
    const isFilled = i < cellsCount;
    const bgColor = isFilled ? (activeColors[i] || "#cbd5e1") : "transparent";
    const border = isFilled ? "none" : "1px solid #cbd5e1";
    const hover = cellHoverValues[i] || "No Activity";
    
    return `
      <div 
        title="${hover}" 
        style="flex: 1; height: 100%; background-color: ${bgColor}; border: ${border}; transition: background 0.3s ease;">
      </div>
    `;
  }).join("");

  // 3. Dynamic Width: We increase the width of the battery container if there are many cells
  const baseWidth = 32;
  const dynamicWidth = status === "activities" ? Math.max(32, maxCells * 7) : (status === "age" ? 26 : 32);

  return `
    <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">
      <img src="/location.png" style="width: 28px; height: 28px; object-fit: contain;" />
      <div style="
        position: relative; 
        width: ${dynamicWidth}px; 
        height: 11px; 
        border: 1.5px solid #475569; 
        border-radius: 2px; 
        padding: 1px; 
        display: flex; 
        gap: 1px; 
        background: white;
        margin-top: -2px; 
      ">
        ${cells}
        <div style="
          position: absolute; 
          right: -3.5px; 
          top: 2.5px; 
          width: 2px; 
          height: 4px; 
          background: #475569; 
          border-radius: 0 1px 1px 0;
        "></div>
      </div>
    </div>
  `;
};

export default function PakistanDrillDown() {
const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1)); // getMonth() is 0-indexed
  const [year, setYear] = useState(String(now.getFullYear()));
  const [level, setLevel] = useState("provinces");
  const [status, setStatus] = useState("activities");
  const [geoData, setGeoData] = useState<any>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [allowedActivities, setAllowedActivities] = useState<string[]>([]);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
// Inside your PakistanDrillDown component
const [localMonth, setLocalMonth] = useState(month);
const [localYear, setLocalYear] = useState(year);
const [historyData, setHistoryData] = useState<any>(null);
const [yearlyHistory, setYearlyHistory] = useState<any[]>([]);
const [isHistoryOpen, setIsHistoryOpen] = useState(false);

useEffect(() => {
  if (selectedLocation?.id) {
    masoolService.fetchPreviousHistory(selectedLocation.id).then((res) => {
      // Handle potential API response structures
      const historyArray = res?.data || res || [];
      
      if (Array.isArray(historyArray)) {
        const sorted = [...historyArray].sort((a, b) => {
          // Extract "01" from "2026_01"
          const getMonthVal = (item: any) => {
            const mStr = item.month || "";
            if (mStr.includes("_")) {
              return parseInt(mStr.split("_")[1], 10);
            }
            return parseInt(mStr, 10) || 0;
          };

          return getMonthVal(a) - getMonthVal(b);
        });
        console.log("Sorted History:", sorted);
        setYearlyHistory(sorted);
      } else {
        setYearlyHistory([]);
      }
    });
  }
}, [selectedLocation]);
// Effect to fetch history when sidebar dropdowns change
useEffect(() => {
  if (selectedLocation) {
    setHistoryData(null); // Reset to null to show loading spinner/text
    
    masoolService.fetchMasoolReport(`${localYear}_${localMonth.padStart(2, '0')}`, level, status)
      .then((data) => {
        // Find the specific user record in the returned data array
        const record = Array.isArray(data) ? data.find((d: any) => d.id === selectedLocation.id) : null;
        
        // If record exists, set it; otherwise set to false (No Record Found)
        setHistoryData(record || "no-record");
      })
      .catch((err) => {
        console.error(err);
        setHistoryData("no-record");
      });
  }
}, [localMonth, localYear, selectedLocation, level, status]);
  const formattedMonthParam = useMemo(() => {
    return `${year}_${month.toString().padStart(2, '0')}`;
  }, [month, year]);

  useEffect(() => {
    activitiesService.getActivities(Number(month), Number(year)).then((res) => {
      // Adjusted based on your specific response structure res.data.activities
      const acts = res?.data?.activities || res?.activities || [];
      setAllowedActivities(acts);
    });
  }, [month, year]);

  useEffect(() => {
    setGeoData(null);
    fetch(`/geojson/pakistan_${level}.json`)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(err => console.error("GeoJSON error:", err));
  }, [level]);

  useEffect(() => {
    masoolService.fetchMasoolReport(formattedMonthParam, level, status)
      .then((data) => setReportData(Array.isArray(data) ? data : []))
      .catch(err => console.error("Report fetch error:", err));
  }, [formattedMonthParam, level, status]);

  const areaStyle = {
    fillColor: "#3c870e",
    weight: 1,
    color: "white",
    fillOpacity: 0.1,
  };
const getBatteryOnlyHtml = (status: string, data: any, allowedActivities: string[]) => {
  let cellsCount = 0;
  let activeColors: string[] = [];
  let maxCells = status === "age" ? 4 : 5; 
  let cellHoverValues = Array(maxCells).fill(""); 

  // --- Reuse your existing logic for data parsing ---
  switch (status) {
    case "activities": {
      const userActsRaw = String(data.activities || "").split(",").map((a) => a.trim()).filter(Boolean);
      const allowedLower = Array.isArray(allowedActivities) ? allowedActivities.map(a => a.toLowerCase()) : [];
      cellsCount = userActsRaw.length;
      maxCells = Math.max(5, cellsCount); 
      cellHoverValues = userActsRaw;
      activeColors = userActsRaw.map((act) => {
        const isAllowed = allowedLower.includes(act.toLowerCase());
        if (isAllowed) {
          const configKey = Object.keys(ACTIVITY_CONFIG).find(k => k.toLowerCase() === act.toLowerCase());
          return configKey ? ACTIVITY_CONFIG[configKey] : "#3b82f6";
        }
        return "#000000"; 
      });
      break;
    }
    case "education":
      activeColors = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"]; 
      const edu = String(data.education_level || "").toUpperCase();
      if (edu.includes("PH.D") || edu.includes("MASTERS")) cellsCount = 5;
      else if (edu.includes("BACHELORS")) cellsCount = 4;
      else if (edu.includes("INTERMEDIATE")) cellsCount = 3;
      else if (edu.includes("MIDDLE")) cellsCount = 2;
      else cellsCount = 1;
      break;
    case "age":
      activeColors = ["#fdba74", "#fb923c", "#f97316", "#ea580c"];
      const ageVal = parseInt(data.age) || 0;
      if (ageVal > 25) cellsCount = 4;
      else if (ageVal >= 18) cellsCount = 3;
      else if (ageVal >= 12) cellsCount = 2;
      else if (ageVal >= 7) cellsCount = 1;
      break;
   case "skill": {
      // Teal Palette: Light to Dark
      activeColors = ["#99f6e4", "#5eead4", "#2dd4bf", "#0d9488", "#0f766e"];
      const val = String(data.skills_level || "").toUpperCase();
      if (val.includes("MODULE 5")) cellsCount = 5;
      else if (val.includes("MODULE 4")) cellsCount = 4;
      else if (val.includes("MODULE 3")) cellsCount = 3;
      else if (val.includes("MODULE 2")) cellsCount = 2;
      else if (val.includes("MODULE 1")) cellsCount = 1;
      break;
    }
    
    case "ideology": {
      // Indigo/Violet Palette: Light to Dark 
      activeColors = ["#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4338ca"];
      const val = String(data.ideological_status || "").toUpperCase();
      if (val.includes("MODULE 5")) cellsCount = 5;
      else if (val.includes("MODULE 4")) cellsCount = 4;
      else if (val.includes("MODULE 3")) cellsCount = 3;
      else if (val.includes("MODULE 2")) cellsCount = 2;
      else if (val.includes("MODULE 1")) cellsCount = 1;
      break;
    }
    case "active":
      cellsCount = Math.min(parseInt(data.active_status) || 0, 5);
      activeColors = ["#4af285", "#27df6a", "#22c55e", "#16a34a", "#14532d"];
      break;
  }

  const cells = Array.from({ length: maxCells }, (_, i) => {
    const isFilled = i < cellsCount;
    const bgColor = isFilled ? (activeColors[i] || "#cbd5e1") : "transparent";
    const border = isFilled ? "none" : "1px solid #cbd5e1";
    return `<div style="flex: 1; height: 100%; background-color: ${bgColor}; border: ${border};"></div>`;
  }).join("");

  const dynamicWidth = status === "activities" ? Math.max(40, maxCells * 8) : 40;

  // Returning ONLY the battery container
  return `
    <div style="
      position: relative; 
      width: ${dynamicWidth}px; 
      height: 14px; 
      border: 1.5px solid #475569; 
      border-radius: 2px; 
      padding: 1px; 
      display: flex; 
      gap: 1px; 
      background: white;
    ">
      ${cells}
      <div style="
        position: absolute; 
        right: -4px; 
        top: 3px; 
        width: 2.5px; 
        height: 5px; 
        background: #475569; 
        border-radius: 0 1px 1px 0;
      "></div>
    </div>
  `;
};
function VisualDetailRow({ label, value, status, data, allowed = [], showActivityList = false }: any) {
  
  const getActivityColor = (act: string) => {
    // 1. Convert everything to lowercase for safe comparison
    const actLower = act.toLowerCase();
    const allowedLower = Array.isArray(allowed) ? allowed.map(a => a.toLowerCase()) : [];

    // 2. Check if the activity is allowed
    const isAllowed = allowedLower.includes(actLower);

    // 3. If not allowed, return black (matching the battery cell logic)
    if (!isAllowed) return "#000000";

    // 4. If allowed, find the config color
    const configKey = Object.keys(ACTIVITY_CONFIG).find(
      key => key.toLowerCase() === actLower
    );
    
    return configKey ? ACTIVITY_CONFIG[configKey] : "#3b82f6"; // Default blue if config missing but allowed
  };

  const renderActivityList = () => {
    const activities = String(data.activities || "").split(",").map(s => s.trim()).filter(Boolean);
    const remarks = String(data.remarks || "").split(",").map(s => s.trim());

    if (activities.length === 0) return <span className="text-sm text-slate-400 italic">No activities</span>;

    return (
      <div className="mt-3 space-y-2">
        {activities.map((act, idx) => {
          const dotColor = getActivityColor(act);
          
          return (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-2">
                {/* Color Dot: Now turns black if getActivityColor returns #000000 */}
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-300" 
                  style={{ backgroundColor: dotColor }}
                />
                <span className={`text-sm font-bold ${dotColor === "#000000" ? 'text-black' : 'text-slate-700'}`}>
                  {act}
                </span>
              </div>
              {remarks[idx] && (
                <p className="text-xs text-slate-500 ml-4.5 pl-2 italic border-l-2 border-slate-200 mt-1">
                  {remarks[idx]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: getBatteryOnlyHtml(status, data, allowed) 
          }} 
        />
      </div>
      {showActivityList ? renderActivityList() : (
        <span className="text-sm font-semibold text-slate-700">{value || "—"}</span>
      )}
    </div>
  );
}
const getVerticalHistoryHtml = (data: any) => {
  const renderPills = (count: number, colors: string[]) => {
    if (count === 0) return `<div style="width: 10px; height: 10px; border-radius: 99px; background: #f1f5f9;"></div>`;
    
    // We reverse the array to stack them correctly (newest/highest color at top)
    return colors.slice(0, count).reverse().map(color => `
      <div style="
        width: 10px; 
        height: 15px; 
        background: ${color}; 
        border-radius: 2px; 
        margin-bottom: 1px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
      "></div>
    `).join("");
  };

  // 1. Activities Logic
  const acts = String(data.activities || "").split(",").filter(Boolean);
  const actColors = acts.map(a => {
    const configKey = Object.keys(ACTIVITY_CONFIG).find(k => k.toLowerCase() === a.trim().toLowerCase());
    return configKey ? ACTIVITY_CONFIG[configKey] : "#000000";
  });

  // 2. Active Status Logic
  const statusCount = Math.min(parseInt(data.active_status) || 0, 5);
  const statusColors = ["#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a"];

  return `
    <div style="display: flex; gap: 4px; align-items: flex-end; min-height: 40px; padding-bottom: 4px;">
      <div style="display: flex; flex-direction: column; justify-content: flex-end;">
        ${renderPills(acts.length, actColors)}
      </div>
      <div style="display: flex; flex-direction: column; justify-content: flex-end;">
        ${renderPills(statusCount, statusColors)}
      </div>
    </div>
  `;
};
const getMonthNameFromKey = (dateStr: string, short: boolean = false): string => {
  if (!dateStr || !dateStr.includes("_")) return "Invalid Date";

  // Split the string and get the second part (month)
  const [_, month] = dateStr.split("_");
  const monthIndex = parseInt(month, 10) - 1; // Convert to 0-indexed for Date

  // Check if month index is valid (0-11)
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return "Invalid Month";
  }

  // Use the native Intl API for localized, clean month names
  return new Intl.DateTimeFormat('en-US', {
    month: short ? 'short' : 'long'
  }).format(new Date(2000, monthIndex));
};
  return (
    <div className="flex flex-col h-screen w-full font-sans bg-gray-50 overflow-hidden">
      <div className="p-4 bg-white border-b shadow-sm flex flex-wrap gap-2 z-[1001] items-center">
  {/* Year Dropdown - Now shows 2020 to current year + 2 */}
  <FilterSelect label="Year" value={year} onChange={setYear}>
    {Array.from({ length: new Date().getFullYear() - 2020 + 20 }, (_, i) => {
      const yearVal = 2020 + i;
      return (
        <option key={yearVal} value={String(yearVal)}>
          {yearVal}
        </option>
      );
    })}
  </FilterSelect>

  {/* Month Dropdown */}
  <FilterSelect label="Month" value={month} onChange={setMonth}>
    {Array.from({ length: 12 }, (_, i) => (
      <option key={i + 1} value={String(i + 1)}>
        {new Date(0, i).toLocaleString('default', { month: 'long' })}
      </option>
    ))}
  </FilterSelect>

  {/* Level Dropdown */}
  <FilterSelect label="Level" value={level} onChange={setLevel}>
    <option value="provinces">Provinces</option>
    <option value="divisions">Divisions</option>
    <option value="districts">Districts</option>
    <option value="tehsils">Tehsils</option>
  </FilterSelect>

  {/* Progress Metric Dropdown */}
  <FilterSelect label="Progress Metric" value={status} onChange={setStatus}>
    <option value="activities">Activities</option>
    <option value="education">Education</option>
    <option value="age">Age</option>
    <option value="skill">Skill</option>
    <option value="ideology">Ideology</option>
    <option value="active">Active Status</option>
  </FilterSelect>
</div>

      <div className="relative flex-1 flex overflow-hidden">
        <div className="relative flex-1 h-full">
          {hoveredName && (
            <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-1.5 shadow-lg rounded-md border-l-4 border-green-600 pointer-events-none">
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{level.slice(0, -1)}</p>
              <p className="text-sm font-bold text-gray-700">{hoveredName}</p>
            </div>
          )}

          <MapContainer center={[30.3753, 69.3451]} zoom={6} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {geoData && (
              <GeoJSON 
                key={level} 
                data={geoData} 
                style={areaStyle}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: (e) => {
                      e.target.setStyle({ fillOpacity: 0.3 });
                      setHoveredName(feature.properties?.ADM3_EN || feature.properties?.ADM2_EN || feature.properties?.ADM1_EN);
                    },
                    mouseout: (e) => {
                      e.target.setStyle(areaStyle);
                      setHoveredName(null);
                    }
                  });
                }}
              />
            )}

            {reportData.map((loc, idx) => (
              <Marker 
                key={`${loc.id}-${idx}-${status}-${month}-${allowedActivities.length}-${loc.activities}`} 
                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                icon={L.divIcon({
                  className: "custom-marker-container",
                  html: getPinnedBatteryHtml(status, loc, allowedActivities),
                  iconSize: [34, 42],
                  iconAnchor: [17, 28],
                })}
                eventHandlers={{ click: () => setSelectedLocation(loc) }}
              />
            ))}
          </MapContainer>
        </div>
<aside className={`transition-all duration-500 bg-white border-l shadow-2xl h-full z-[1002] ${selectedLocation ? 'w-[400px]' : 'w-0'}`}>

  {selectedLocation && (
    <div className="flex flex-col h-full min-w-[400px]">
      {/* Header with Local Selectors */}
      <div className="p-6 bg-green-700 text-white shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{selectedLocation.name}</h2>
            <p className="text-xs opacity-75 uppercase font-bold tracking-widest">{level.slice(0, -1)} Profile</p>
          </div>
          <button onClick={() => setSelectedLocation(null)} className="text-2xl hover:text-red-300 transition-colors">&times;</button>
        </div>
        
        <div className="flex gap-2 bg-green-800/50 p-2 rounded-lg border border-green-600/50">
          <select 
            className="flex-1 bg-transparent text-xs font-bold outline-none cursor-pointer"
            value={localYear} 
            onChange={(e) => setLocalYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => 2026 + i).map(y => (
              <option key={y} value={String(y)} className="text-black">{y}</option>
            ))}
          </select>
          <div className="w-[1px] bg-green-600/50" />
          <select 
            className="flex-1 bg-transparent text-xs font-bold outline-none cursor-pointer"
            value={localMonth} 
            onChange={(e) => setLocalMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)} className="text-black">
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>
<div className="mb-6 border border-slate-200  overflow-hidden bg-white">
  <button 
    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
    className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 transition-all"
  >
    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">Previous Performance Trend</span>
    <span className={`text-slate-400 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`}>
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
    </span>
  </button>
  
  {isHistoryOpen && (
    <div className="p-5 overflow-x-auto custom-scrollbar">
      <div className="flex gap-6 min-w-max items-end">
        {yearlyHistory.length > 0 ? yearlyHistory.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center group">
            {/* The Vertical Pill Stack */}
            <div 
              className="transition-transform duration-300 group-hover:-translate-y-1"
              dangerouslySetInnerHTML={{ __html: getVerticalHistoryHtml(item) }} 
            />
            
            {/* Simple Month Label */}
            <span className="mt-2 text-[10px] font-bold text-slate-400 group-hover:text-green-600 transition-colors">
              {item.month_name?.substring(0, 3) || ` ${getMonthNameFromKey(item.month)}`}
            </span>
          </div>
        )) : (
          <div className="w-full text-center py-4 text-slate-400 text-xs italic">
            No history found for this year
          </div>
        )}
      </div>
    </div>
  )}
</div>
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {historyData === null ? (
          /* 1. Loading State */
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching history...</p>
          </div>
        ) : historyData === "no-record" ? (
          /* 2. No Record Found State */
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-200 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-slate-700 font-bold">No Record Found</h3>
            <p className="text-slate-400 text-xs mt-2">There is no performance data available for this specific month and year.</p>
          </div>
        ) : (
          /* 3. Data Found State */
          <div className="space-y-2">
            <VisualDetailRow 
              label="Activities & Remarks" 
              status="activities" 
              data={historyData} 
              allowed={allowedActivities} 
              showActivityList={true} 
            />
            <VisualDetailRow label="Education" value={historyData.education_level} status="education" data={historyData} />
            <VisualDetailRow label="Skill Level" value={historyData.skills_level} status="skill" data={historyData} />
            <VisualDetailRow label="Ideology" value={historyData.ideological_status} status="ideology" data={historyData} />
            <VisualDetailRow label="Active Status" value={`Level ${historyData.active_status}`} status="active" data={historyData} />
            
           
          </div>
        )}
      </div>
    </div>
  )}
</aside>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col w-48">
      <label className="text-[12px]  text-black-600 uppercase mb-1 ">{label}</label>
      <select 
        className="border border-gray-200 rounded-lg p-2 text-sm bg-white font-medium outline-none shadow-sm cursor-pointer hover:border-green-500 transition-colors" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value || "—"}</span>
    </div>
  );
}