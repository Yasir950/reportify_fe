"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DownloadIcon } from "../Tables/icons";
import { masoolService } from "@/services/masoolService";

const DataPreviewTable: React.FC = () => {
  const [excelData, setExcelData] = useState<(string | number)[][]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatus(null); // Clear old messages

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
      await masoolService.uploadMasoolData(selectedFile, "AMS");
      setStatus({ type: "success", msg: "Data uploaded successfully!" });
      // Optional: Clear table after successful upload
      // setExcelData([]);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      ["Name", "Email", "Age", "Department"],
      ["John Doe", "john@example.com", 28, "Engineering"],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "Sample_File.xlsx");
  };

  return (
    <div className="mt-6">
      <div className="mb-6 rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Upload Masool Data
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelUpload}
            className="flex-1 rounded-md border border-gray-400 bg-gray-50 p-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />

          {/* New API Submit Button */}
          {excelData.length > 0 && (
            <button
              onClick={handleApiSubmit}
              disabled={loading}
              className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Uploading..." : "Confirm Upload"}
            </button>
          )}

          <button
            type="button"
            onClick={downloadSampleExcel}
            className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          >
            <DownloadIcon className="mr-2" /> Sample
          </button>
        </div>

        {status && (
          <div className={`mt-4 rounded p-3 text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.msg}
          </div>
        )}
      </div>

      {/* Table Preview Section */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {excelData.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No file selected for preview.</div>
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
                <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50">
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