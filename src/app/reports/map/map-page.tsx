"use client";

import { useState, useEffect } from "react";
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { masoolService } from "@/services/masoolService";

// --- 1. Dynamic SVG Pin Generator ---
const getDynamicPin = (color: string) => {
  return L.divIcon({
    className: "custom-pin",
    html: `
      <svg width="24" height="32" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 2px rgba(0,0,0,0.3));">
        <path d="M12 28.5C12 28.5 21 18.5 21 11.5C21 6.80558 16.9706 3 12 3C7.02944 3 3 6.80558 3 11.5C3 18.5 12 28.5 12 28.5Z" 
              fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="11.5" r="3" fill="white"/>
      </svg>`,
    iconSize: [24, 32],
    iconAnchor: [17, 42], // Bottom tip of the pin
    popupAnchor: [0, -40],
  });
};

// --- 2. Color Logic ---
const getStatusColor = (statusType: string, val: any) => {
  const value = String(val || "").toUpperCase().trim();
  
  switch (statusType) {
    case "activities":
      if (value === "S") return "#991b1b"; // Deep Red
      if (value === "D") return "#1e40af"; // Deep Blue
      if (value === "C") return "#065f46"; // Deep Emerald
      if (value === "H") return "#92400e"; // Deep Amber
      return "#334155"; // Slate Gray

    case "skill":
      if (value.includes("MODULE 1")) return "#6b21a8"; // Deep Purple
      if (value.includes("MODULE 2")) return "#9d174d"; // Deep Pink
      if (value.includes("MODULE 3")) return "#155e75"; // Deep Cyan
      if (value.includes("MODULE 4")) return "#0f766e"; // Deep Teal
      return "#334155";

    case "ideology":
      if (value.includes("MODULE 1")) return "#3730a3"; // Deep Indigo
      if (value.includes("MODULE 2")) return "#5b21b6"; // Deep Violet
      if (value.includes("MODULE 3")) return "#86198f"; // Deep Fuchsia
      if (value.includes("MODULE 4")) return "#9f1239"; // Deep Rose
      return "#334155";

    case "education":
      if (value.includes("UNDER MATRIC")) return "#1e3a8a"; // Navy
      if (value.includes("MATRIC")) return "#4d7c0f";       // Olive
      if (value.includes("INTERMEDIATE")) return "#701a75"; // Plum
      if (value.includes("BACHELORS")) return "#115e59";    // Pine
      if (value.includes("MASTERS")) return "#881337";      // Maroon
      if (value.includes("PHD")) return "#4c0519";          // Wine
      return "#334155";

    case "age":
      const age = parseInt(value);
      if (isNaN(age)) return "#475569";
      if (age >= 7 && age <= 12) return "#65a30d";  // Hard Lime
      if (age >= 13 && age <= 17) return "#3f6212"; // Deep Lime
      if (age >= 18 && age <= 25) return "#166534"; // Dark Green
      if (age > 25) return "#064e3b";               // Midnight Green
      return "#334155";

    case "active":
      if (value === "1") return "#fca5a5"; // Soft Coral (Lightest)
      if (value === "2") return "#dc2626"; // Strong Red
      if (value === "3") return "#7f1d1d"; // Blood Red (Darkest)
      return "#334155";

    default:
      return "#1e293b"; // Rich Slate Default
  }
};

export default function PakistanDrillDown() {
  const [month, setMonth] = useState("1");
  const [level, setLevel] = useState("provinces");
  const [status, setStatus] = useState("activities");
  const [geoData, setGeoData] = useState<any>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  // --- 3. Simple Area Style (No Pinned Highlight) ---
  const getAreaStyle = () => ({
    fillColor: "#3c870e", // Consistent neutral color
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.1,
  });

  useEffect(() => {
    setGeoData(null);
    fetch(`/geojson/pakistan_${level}.json`)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("GeoJSON Load Error:", err));
  }, [level]);

  useEffect(() => {
    masoolService.fetchMasoolReport(month, level, status)
      .then((data) => setReportData(Array.isArray(data) ? data : []))
      .catch(() => setReportData([]));
  }, [month, level, status]);

  return (
    <div className="flex flex-col h-screen w-full font-sans bg-gray-50 overflow-hidden">
      
      {/* 🛠️ FILTER PANEL */}
      <div className="p-4 bg-white border-b shadow-sm flex gap-6 z-[1001]">
        <FilterSelect label="Month" value={month} onChange={setMonth}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Level" value={level} onChange={setLevel}>
          <option value="provinces">Provinces</option>
          <option value="divisions">Divisions</option>
          <option value="districts">Districts</option>
          <option value="tehsils">Tehsils</option>
        </FilterSelect>

        <FilterSelect label="Status" value={status} onChange={setStatus}>
          <option value="activities">Activities</option>
          <option value="education">Education</option>
          <option value="age">Age</option>
          <option value="skill">Skill</option>
          <option value="ideology">Ideological</option>
          <option value="active">Active</option>
        </FilterSelect>
      </div>

      <div className="relative flex-1 flex overflow-hidden">
        
        {/* 🗺️ MAP SECTION */}
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
                style={getAreaStyle}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: (e) => {
                      e.target.setStyle({ fillOpacity: 0.3 });
                      setHoveredName(feature.properties?.ADM3_EN || feature.properties?.ADM2_EN || feature.properties?.ADM1_EN);
                    },
                    mouseout: (e) => {
                      e.target.setStyle(getAreaStyle());
                      setHoveredName(null);
                    },
                    click: (e) => e.target._map.fitBounds(e.target.getBounds())
                  });
                }}
              />
            )}

            {/* 📍 PIN DROPS */}
            {reportData.map((loc, idx) => {
              const lat = parseFloat(loc.latitude);
              const lng = parseFloat(loc.longitude);
              if (isNaN(lat) || isNaN(lng)) return null;

              // Determine display value for hover based on selected status
             const hoverValue = 
    status === "activities" ? loc.activity : 
    status === "education" ? loc.education_level : 
    status === "age" ? `${loc.age} Years` : 
    status === "skill" ? loc.skills_level : 
    status === "ideology" ? loc.ideological_status : 
    status === "active" ? `Level ${loc.active_status}` : 
    "N/A";

  // 2. Determine which raw data field to send to getStatusColor (The Code/Key)
  const colorKey = 
    status === "activities" ? loc.activity : // Sends "S", "D", etc.
    status === "education" ? loc.education_level : 
    status === "age" ? loc.age : 
    status === "skill" ? loc.skills_level : 
    status === "ideology" ? loc.ideological_status : 
    status === "active" ? loc.active_status : // Sends "1", "2", or "3"
    "";

  const pinColor = getStatusColor(status, colorKey);

              return (
                <Marker 
                  key={`${loc.id}-${idx}`} 
                  position={[lat, lng]}
                  icon={getDynamicPin(pinColor)}
                  eventHandlers={{ click: () => setSelectedLocation(loc) }}
                >
                  {/* HOVER TOOLTIP */}
                  <Tooltip direction="top" offset={[0, -32]} opacity={1}>
                    <div className="px-1 py-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{status}</p>
                      <p className="text-sm font-semibold text-gray-800">{hoverValue || "N/A"}</p>
                    </div>
                  </Tooltip>
                  
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold border-b pb-1 mb-1">{loc.name}</p>
                      <p className="text-xs text-gray-600">{loc.district}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* 📋 DETAILS SIDEBAR */}
        <aside className={`transition-all duration-500 bg-white border-l shadow-2xl h-full overflow-y-auto z-[1002] ${selectedLocation ? 'w-[400px]' : 'w-0'}`}>
          {selectedLocation && (
            <div className="p-0 flex flex-col h-full min-w-[400px]">
              <div className="p-6 bg-green-600 text-white flex justify-between items-center sticky top-0">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLocation.name}</h2>
                  <p className="text-sm opacity-80">{selectedLocation.district}, {selectedLocation.province}</p>
                </div>
                <button onClick={() => setSelectedLocation(null)} className="text-white text-3xl hover:opacity-70 transition-opacity">&times;</button>
              </div>

              <div className="p-6 space-y-6">
                <DataSection title="General Info">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label="Age" value={selectedLocation.age} />
                    <DetailBox label="Education" value={selectedLocation.education_level} />
                    <DetailBox label="Skill Level" value={selectedLocation.skills_level} />
                  </div>
                </DataSection>

                <DataSection title="Activity Tracking">
                  <div className="space-y-4">
                    <DetailRow label="Current Activity" value={selectedLocation.activity_details} />
                    <DetailRow label="Status" value={selectedLocation.active_status} />
                    <DetailRow label="Remarks" value={selectedLocation.remarks} />
                  </div>
                </DataSection>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// --- Internal Helpers ---
function FilterSelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
      <select 
        className="border border-gray-200 rounded-md p-2 text-sm outline-none w-48 bg-white cursor-pointer" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

function DataSection({ title, children }: any) {
  return (
    <section>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">{title}</h3>
      {children}
    </section>
  );
}

function DetailBox({ label, value }: any) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-sm text-gray-500 min-w-[120px]">{label}:</p>
      <p className="text-sm font-semibold text-gray-800 text-right">{value || "—"}</p>
    </div>
  );
}