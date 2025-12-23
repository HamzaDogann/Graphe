"use client";

import { useState, useCallback } from "react";
import { ParsedData } from "@/types/dataset";
import Papa from "papaparse";
import * as XLSX from "xlsx";


export const useFileParser = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dosya boyutunu okunabilir formata çevirir (KB, MB)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const parseFile = useCallback((file: File) => {
    setLoading(true);
    setError(null);
    setData(null);

    const fileType = file.name.split(".").pop()?.toLowerCase();
    const fileSize = formatFileSize(file.size);

    // 1. JSON PARSING
    if (fileType === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setData({ type: "json", content: json, fileName: file.name, fileSize });
        } catch (err) {
          setError("Invalid JSON format");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } 
    
    // 2. CSV PARSING
    else if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = Object.keys(results.data[0] as object);
            setData({ type: "table", headers, rows: results.data, fileName: file.name, fileSize });
          } else {
            setError("Empty CSV file");
          }
          setLoading(false);
        },
        error: () => {
          setError("Error parsing CSV");
          setLoading(false);
        },
      });
    } 
    
    // 3. EXCEL PARSING (XLS, XLSX)
    else if (fileType === "xls" || fileType === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0]; // İlk sayfayı al
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

          if (jsonData && jsonData.length > 0) {
            const headers = jsonData[0] as string[];
            // Satırları objeye çevirelim (React-Window için daha kolay)
            const rows = jsonData.slice(1).map((row: any) => {
              const rowData: any = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index];
              });
              return rowData;
            });

            setData({ type: "table", headers, rows, fileName: file.name, fileSize });
          } else {
            setError("Empty Excel sheet");
          }
        } catch (err) {
          setError("Error parsing Excel file");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError("Unsupported file format");
      setLoading(false);
    }
  }, []);

  return { parseFile, data, loading, error };
};