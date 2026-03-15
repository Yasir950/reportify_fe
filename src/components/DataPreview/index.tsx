"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DownloadIcon } from "../Tables/icons";
import { masoolService } from "@/services/masoolService";

// Define the available upload types
type UploadType = "masool_data" | "masool_report";

const DataPreviewTable: React.FC = () => {
  const [excelData, setExcelData] = useState<(string | number)[][]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("masool_data");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatus(null);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      blankrows: false,
    });

    setExcelData(jsonData);
  };

  const handleApiSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setStatus(null);

    try {
      // Logic to switch between APIs based on selection
      if (uploadType === "masool_data") {
        await masoolService.uploadMasoolData(selectedFile, "AMS");
      } else {
        await masoolService.uploadMasoolReportData(selectedFile, "AMS");
      }

      setStatus({ 
        type: "success", 
        msg: `${uploadType === "masool_data" ? "Masool Data" : "Masool Report"} uploaded successfully!` 
      });
      
      // Clear data after success
      setExcelData([]);
      setSelectedFile(null);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = uploadType === "masool_data" 
      ? [["Name", "Email", "Age", "Department"], ["John Doe", "john@example.com", 28, "Engineering"]]
      : [["Report ID", "Date", "Performance", "Remarks"], ["R-101", "2026-03-15", "Excellent", "On track"]];
    
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, `${uploadType}_Sample.xlsx`);
  };

  return (
    <div className="mt-6">
      <div className="mb-6 rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Upload System Data
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
          {/* 1. Dropdown for File Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Select Upload Category</label>
            <select
              value={uploadType}
              onChange={(e) => {
                setUploadType(e.target.value as UploadType);
                setExcelData([]); // Clear preview when switching type
                setStatus(null);
              }}
              className="rounded-md border border-gray-400 bg-white p-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="masool_data">Masool Data</option>
              <option value="masool_report">Masool Report Data</option>
            </select>
          </div>

          {/* 2. File Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Choose File</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="rounded-md border border-gray-400 bg-gray-50 p-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>

          {/* 3. Action Buttons */}
          <div className="flex gap-2">
            {excelData.length > 0 && (
              <button
                onClick={handleApiSubmit}
                disabled={loading}
                className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Uploading..." : "Confirm Upload"}
              </button>
            )}

            <button
              type="button"
              onClick={downloadSampleExcel}
              className="flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white transition-all dark:border-primary"
            >
              <DownloadIcon className="mr-2" /> Sample
            </button>
          </div>
        </div>

        {status && (
          <div className={`mt-4 rounded p-3 text-sm flex items-center gap-2 ${
            status.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            <span className="font-bold">{status.type === 'success' ? '✓' : '⚠'}</span>
            {status.msg}
          </div>
        )}
      </div>

      {/* Table Preview Section */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Previewing: {uploadType.replace('_', ' ')}</span>
            {excelData.length > 0 && <span className="text-xs text-gray-500">{excelData.length - 1} rows detected</span>}
        </div>
        
        {excelData.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic">No file selected for preview.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {excelData[0].map((col, i) => (
                  <th key={i} className="border-b border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    {col ?? `Col ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      {cell?.toString() ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataPreviewTable;