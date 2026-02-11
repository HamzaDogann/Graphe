import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { 
  ParsedData, 
  ColumnMetadata, 
  ColumnType, 
  MAX_CACHE_SIZE 
} from "@/types/dataset";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Sample data for testing
const SAMPLE_DATA = [
  { "City": "Istanbul", "Sales": 150000, "Category": "Electronics" },
  { "City": "Ankara", "Sales": 90000, "Category": "Clothing" },
  { "City": "Izmir", "Sales": 120000, "Category": "Electronics" },
  { "City": "Ankara", "Sales": 50000, "Category": "Groceries" },
  { "City": "Istanbul", "Sales": 80000, "Category": "Clothing" },
  { "City": "Bursa", "Sales": 70000, "Category": "Electronics" },
  { "City": "Izmir", "Sales": 110000, "Category": "Groceries" },
  { "City": "Istanbul", "Sales": 200000, "Category": "Electronics" },
  { "City": "Bursa", "Sales": 65000, "Category": "Clothing" },
  { "City": "Ankara", "Sales": 95000, "Category": "Electronics" },
];

const DEFAULT_PARSED_DATA: ParsedData = {
  type: "table",
  headers: ["City", "Sales", "Category"],
  rows: SAMPLE_DATA,
  rowCount: SAMPLE_DATA.length,
  columnCount: 3,
  fileName: "sample_data.csv",
  fileSize: "1 KB",
  parsedAt: "2026-01-01T00:00:00.000Z", // Static date to avoid hydration mismatch
  columns: [
    { name: "City", type: "string", uniqueValues: 4 },
    { name: "Sales", type: "number", uniqueValues: 10 },
    { name: "Category", type: "string", uniqueValues: 3 },
  ],
};

// Helper: Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper: Detect column type
const detectColumnType = (values: any[]): ColumnType => {
  const sampleSize = Math.min(values.length, 100);
  const sample = values.slice(0, sampleSize).filter(v => v != null && v !== "");
  
  if (sample.length === 0) return "unknown";
  
  let numberCount = 0;
  let booleanCount = 0;
  let dateCount = 0;
  
  for (const val of sample) {
    if (typeof val === "number" || (!isNaN(Number(val)) && val !== "")) {
      numberCount++;
    } else if (typeof val === "boolean" || val === "true" || val === "false") {
      booleanCount++;
    } else if (!isNaN(Date.parse(val))) {
      dateCount++;
    }
  }
  
  const threshold = sample.length * 0.8;
  
  if (numberCount >= threshold) return "number";
  if (booleanCount >= threshold) return "boolean";
  if (dateCount >= threshold) return "date";
  if (numberCount > 0 || dateCount > 0) return "mixed";
  return "string";
};

// Helper: Extract column metadata
const extractColumnMetadata = (headers: string[], rows: Record<string, any>[]): ColumnMetadata[] => {
  return headers.map(header => {
    const values = rows.map(row => row[header]);
    const nonNullValues = values.filter(v => v != null && v !== "");
    const uniqueValues = new Set(nonNullValues).size;
    const nullCount = values.length - nonNullValues.length;
    const sampleValues = nonNullValues.slice(0, 5);
    
    return {
      name: header,
      type: detectColumnType(values),
      uniqueValues,
      nullCount,
      sampleValues,
    };
  });
};

// Helper: Estimate JSON size for cache limit check
const estimateJsonSize = (obj: any): number => {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return Infinity;
  }
};

interface DatasetState {
  // Data
  parsedData: ParsedData | null;
  isLoading: boolean;
  error: string | null;
  
  // File reference (not persisted)
  currentFile: File | null;
  
  // Cache info
  isCached: boolean;
  cacheSize: number;
  
  // Actions
  parseFile: (file: File) => Promise<void>;
  setParsedData: (data: ParsedData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadSampleData: () => void;
  clearCache: () => void;
  
  // Column utilities
  getColumnNames: () => string[];
  getColumnByName: (name: string) => ColumnMetadata | undefined;
  getNumericColumns: () => ColumnMetadata[];
  getCategoricalColumns: () => ColumnMetadata[];
  getColumnValues: (columnName: string) => any[];
  getUniqueValues: (columnName: string) => any[];
}

export const useDatasetStore = create<DatasetState>()(
  devtools(
    persist(
      (set, get) => ({
        parsedData: DEFAULT_PARSED_DATA,
        isLoading: false,
        error: null,
        currentFile: null,
        isCached: false,
        cacheSize: 0,
        
        // Parse file and store data
        parseFile: async (file: File) => {
          // Prevent multiple simultaneous parsing
          if (get().isLoading) {
            return;
          }
          
          set({ isLoading: true, error: null, currentFile: file });
          
          const fileType = file.name.split(".").pop()?.toLowerCase();
          const fileSize = formatFileSize(file.size);
          
          try {
            // Early check for empty file
            if (file.size === 0) {
              set({
                error: "The dataset is empty. Please upload a file with data.",
                isLoading: false,
                parsedData: null,
              });
              return;
            }
            
            let parsedData: ParsedData | null = null;
            
            // JSON Parsing
            if (fileType === "json") {
              const text = await file.text();
              
              // Check if file is empty
              if (!text || text.trim().length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              let json;
              try {
                json = JSON.parse(text);
              } catch {
                set({
                  error: "Invalid JSON format. Please upload a valid JSON file.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              // Check if JSON is empty array
              if (Array.isArray(json) && json.length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              // Check if JSON is empty object
              if (!Array.isArray(json) && typeof json === "object" && json !== null && Object.keys(json).length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              // Check if JSON is an array of objects (table-like)
              if (Array.isArray(json) && json.length > 0 && typeof json[0] === "object" && json[0] !== null) {
                const headers = Object.keys(json[0]);
                if (headers.length === 0) {
                  set({
                    error: "The dataset has no columns. Please upload a file with valid data.",
                    isLoading: false,
                    parsedData: null,
                  });
                  return;
                }
                const columns = extractColumnMetadata(headers, json);
                parsedData = {
                  type: "table",
                  headers,
                  rows: json,
                  rowCount: json.length,
                  columnCount: headers.length,
                  columns,
                  fileName: file.name,
                  fileSize,
                  parsedAt: new Date().toISOString(),
                };
              } else {
                // Non-array JSON content
                parsedData = {
                  type: "json",
                  content: json,
                  fileName: file.name,
                  fileSize,
                  parsedAt: new Date().toISOString(),
                };
              }
            }
            
            // CSV Parsing
            else if (fileType === "csv") {
              const text = await file.text();
              
              // Check if file is empty
              if (!text || text.trim().length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const result = Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true, // Auto-detect numbers
              });
              
              if (!result.data || result.data.length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const firstRow = result.data[0];
              if (!firstRow || typeof firstRow !== "object") {
                set({
                  error: "Invalid CSV format. Please upload a valid CSV file.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const headers = Object.keys(firstRow as object);
              const rows = result.data as Record<string, any>[];
              
              // Check if there's actual data (not just headers)
              if (headers.length === 0 || rows.length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const columns = extractColumnMetadata(headers, rows);
              
              parsedData = {
                type: "table",
                headers,
                rows,
                rowCount: rows.length,
                columnCount: headers.length,
                columns,
                fileName: file.name,
                fileSize,
                parsedAt: new Date().toISOString(),
              };
            }
            
            // Excel Parsing
            else if (fileType === "xls" || fileType === "xlsx") {
              let buffer;
              try {
                buffer = await file.arrayBuffer();
              } catch {
                set({
                  error: "Failed to read Excel file. Please try again.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              let workbook;
              try {
                workbook = XLSX.read(buffer, { type: "array" });
              } catch {
                set({
                  error: "Invalid Excel format. Please upload a valid Excel file.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                set({
                  error: "The Excel file has no sheets. Please upload a valid file.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
              
              // Check if file is empty or has no data rows (only header or less)
              if (!jsonData || jsonData.length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              if (jsonData.length < 2) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const headers = jsonData[0] as string[];
              if (!headers || headers.length === 0) {
                set({
                  error: "The dataset has no columns. Please upload a file with valid data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const rows = jsonData.slice(1).map((row: any[]) => {
                const rowData: Record<string, any> = {};
                headers.forEach((header, index) => {
                  rowData[header] = row[index];
                });
                return rowData;
              });
              
              // Filter out completely empty rows
              const nonEmptyRows = rows.filter(row => 
                Object.values(row).some(val => val != null && val !== "")
              );
              
              if (nonEmptyRows.length === 0) {
                set({
                  error: "The dataset is empty. Please upload a file with data.",
                  isLoading: false,
                  parsedData: null,
                });
                return;
              }
              
              const columns = extractColumnMetadata(headers, nonEmptyRows);
              
              parsedData = {
                type: "table",
                headers,
                rows: nonEmptyRows,
                rowCount: nonEmptyRows.length,
                columnCount: headers.length,
                columns,
                fileName: file.name,
                fileSize,
                parsedAt: new Date().toISOString(),
              };
            } else {
              set({
                error: "Unsupported file format. Please upload CSV, Excel, or JSON files.",
                isLoading: false,
                parsedData: null,
              });
              return;
            }
            
            // Ensure parsedData was set
            if (!parsedData) {
              set({
                error: "Failed to parse file. Please try a different file.",
                isLoading: false,
                parsedData: null,
              });
              return;
            }
            
            // Check cache size and decide to cache or not
            const estimatedSize = estimateJsonSize(parsedData);
            const shouldCache = estimatedSize <= MAX_CACHE_SIZE;
            
            set({
              parsedData,
              isLoading: false,
              error: null,
              isCached: shouldCache,
              cacheSize: shouldCache ? estimatedSize : 0,
            });
            
          } catch (err) {
            // Catch any unexpected errors
            console.error("Error parsing file:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to parse file. Please try again.";
            set({
              error: errorMessage,
              isLoading: false,
              parsedData: null,
            });
          }
        },
        
        setParsedData: (data) => {
          const estimatedSize = data ? estimateJsonSize(data) : 0;
          const shouldCache = estimatedSize <= MAX_CACHE_SIZE;
          set({ 
            parsedData: data,
            isCached: shouldCache,
            cacheSize: shouldCache ? estimatedSize : 0,
          });
        },
        
        setIsLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        
        reset: () => set({ 
          parsedData: null, 
          isLoading: false, 
          error: null, 
          currentFile: null,
          isCached: false,
          cacheSize: 0,
        }),
        
        loadSampleData: () => set({ 
          parsedData: DEFAULT_PARSED_DATA, 
          currentFile: null,
          isCached: true,
          cacheSize: estimateJsonSize(DEFAULT_PARSED_DATA),
        }),
        
        clearCache: () => {
          localStorage.removeItem("dataset-storage");
          set({ 
            parsedData: null, 
            isCached: false, 
            cacheSize: 0 
          });
        },
        
        // Column utilities
        getColumnNames: () => {
          const { parsedData } = get();
          return parsedData?.headers || [];
        },
        
        getColumnByName: (name: string) => {
          const { parsedData } = get();
          return parsedData?.columns?.find(col => col.name === name);
        },
        
        getNumericColumns: () => {
          const { parsedData } = get();
          return parsedData?.columns?.filter(col => col.type === "number") || [];
        },
        
        getCategoricalColumns: () => {
          const { parsedData } = get();
          return parsedData?.columns?.filter(col => 
            col.type === "string" && (col.uniqueValues || 0) < 50
          ) || [];
        },
        
        getColumnValues: (columnName: string) => {
          const { parsedData } = get();
          if (!parsedData?.rows) return [];
          return parsedData.rows.map(row => row[columnName]);
        },
        
        getUniqueValues: (columnName: string) => {
          const { parsedData } = get();
          if (!parsedData?.rows) return [];
          const values = parsedData.rows.map(row => row[columnName]);
          return [...new Set(values.filter(v => v != null))];
        },
      }),
      {
        name: "dataset-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => {
          // Only persist parsedData if it's within cache size limit
          if (state.isCached && state.parsedData) {
            return { 
              parsedData: state.parsedData,
              isCached: state.isCached,
              cacheSize: state.cacheSize,
            };
          }
          return {};
        },
      }
    ),
    { name: "DatasetStore" }
  )
);