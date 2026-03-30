// 'use client';

// import { useState } from "react";
// import { GoogleMap, LoadScript, Circle, Marker } from "@react-google-maps/api";
// import jsPDF from "jspdf";

// const containerStyle = { width: "100%", height: "500px" };
// const center = { lat: 30.3753, lng: 69.3451 }; // Center of Pakistan

// // Sample city data
// const cities = [
//   {
//     name: "Islamabad",
//     lat: 33.6844,
//     lng: 73.0479,
//     selected: true,
//     info: "Capital city of Pakistan. Population: 1.0M"
//   },
//   {
//     name: "Karachi",
//     lat: 24.8607,
//     lng: 67.0011,
//     selected: false,
//     info: "Largest city of Pakistan. Population: 15M"
//   },
//   {
//     name: "Lahore",
//     lat: 31.5497,
//     lng: 74.3436,
//     selected: true,
//     info: "Cultural heart of Pakistan. Population: 11M"
//   }
// ];

// export default function ClickableCityMap() {
//   const [modalCity, setModalCity] = useState<null | typeof cities[0]>(null);

//   // Generate a PDF with real text
//   const generatePDF = (city: typeof cities[0]) => {
//     const pdf = new jsPDF();
//     pdf.setFontSize(18);
//     pdf.text(city.name, 20, 30); // City name
//     pdf.setFontSize(12);
//     pdf.text(city.info, 20, 50, { maxWidth: 170 }); // Info text
//     pdf.save(`${city.name}.pdf`);
//   };

//   return (
//     <>
//       <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
//         <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
//           {cities.map((city) => (
//             <div key={city.name}>
//               {/* Marker for city */}
//               <Marker position={{ lat: city.lat, lng: city.lng }} />

//               {/* Circle overlay for selected cities */}
//               {city.selected && (
//                 <Circle
//                   center={{ lat: city.lat, lng: city.lng }}
//                   radius={40000} // 30 km
//                   options={{
//                     fillColor: "rgba(255,0,0,0.3)",
//                   strokeColor: "red",
//                     strokeWeight: 2,
//                   }}
//                   onClick={() => setModalCity(city)} // Open modal on click
//                 />
//               )}
//             </div>
//           ))}
//         </GoogleMap>
//       </LoadScript>

//       {/* Modal */}
//       {modalCity && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100vw",
//             height: "100vh",
//             backgroundColor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 9999,
//           }}
//           onClick={() => setModalCity(null)} // Close modal on backdrop click
//         >
//           <div
//             style={{
//               background: "#fff",
//               padding: "20px",
//               borderRadius: "8px",
//               minWidth: "300px",
//               maxWidth: "500px",
//             }}
//             onClick={(e) => e.stopPropagation()} // Prevent modal click from closing
//           >
//             <h2>{modalCity.name}</h2>
//             <p>{modalCity.info}</p>

//             <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
//               {/* Download PDF */}
//               <button
//                 style={{
//                   padding: "8px 16px",
//                   background: "blue",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                 }}
//                 onClick={() => generatePDF(modalCity)}
//               >
//                 Download PDF
//               </button>

//               {/* Close Modal */}
//               <button
//                 style={{
//                   padding: "8px 16px",
//                   background: "gray",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                 }}
//                 onClick={() => setModalCity(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
