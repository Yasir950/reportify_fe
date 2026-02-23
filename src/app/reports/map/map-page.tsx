"use client";

import { useState, useEffect } from "react";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function PakistanDrillDown() {
  // --- States ---
  const [month, setMonth] = useState("1");
  const [level, setLevel] = useState("provinces");
  const [status, setStatus] = useState("age");
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // --- Effects ---
  // This fetches data whenever the 'level' changes
  useEffect(() => {
    // Reset data to null to trigger a clean reload if desired
    setGeoData(null); 
    
    fetch(`/geojson/pakistan_${level}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load geojson:", err));
  }, [level]);

  // --- Map Styling & Interaction ---
  const defaultStyle = {
    fillColor: "#22c55e",
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.2,
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name =
      feature.properties?.ADM3_EN || 
      feature.properties?.ADM2_EN || 
      feature.properties?.ADM1_EN || 
      "Unknown";

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.7, weight: 2, fillColor: "#15803d" });
        setHoveredName(name);
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(defaultStyle);
        setHoveredName(null);
      },
      click: () => console.log(`Clicked on: ${name}, Month: ${month}, Status: ${status}`),
    });
  };

  return (
    <>
      {/* 🛠️ TOP CONTROL PANEL (Outside/Above Map) */}
      <div className="mb-4 flex gap-4">
        
        {/* Month Selector */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 uppercase mb-1">Select Month</label>
          <select 
            className="w-64 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500"
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Level Selector */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 uppercase mb-1">Select Level</label>
          <select 
            className="w-64 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500"
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="provinces">Provinces</option>
            <option value="divisions">Divisions</option>
            <option value="districts">Districts</option>
            <option value="tehsils">Tehsils</option>
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 uppercase mb-1">Select Status</label>
          <select 
            className="w-64 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500"
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="age">Age</option>
            <option value="education">Education</option>
            <option value="ideology">Ideology</option>
            <option value="skill">Skill</option>
            <option value="active">Active</option>
            <option value="activities">Activities</option>
          </select>
        </div>
      </div>
    <div className="flex flex-col h-screen w-full font-sans bg-gray-50">
      

      {/* 🗺️ THE MAP SECTION */}
      <div className="relative flex-1">
        
        {/* Hover Tooltip (Now relative to the map container) */}
        {hoveredName && (
          <div className="absolute top-4 right-4 z-[1000] bg-black/80 text-white px-4 py-2 rounded-md pointer-events-none">
            <p className="text-[10px] uppercase tracking-widest opacity-70">{level.slice(0, -1)}</p>
            <p className="text-md font-bold">{hoveredName}</p>
          </div>
        )}

        <MapContainer 
          center={[30.3753, 69.3451]} 
          zoom={6} 
          className="h-full w-full"
          zoomControl={true} 
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {geoData && (
            <GeoJSON 
              /* IMPORTANT: Key ensures the component re-mounts when level or data changes */
              key={`${level}-${month}-${status}`} 
              data={geoData} 
              style={defaultStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
    </div>
    </>
  );
}