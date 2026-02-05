import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ParsedData } from "@/types/dataset";

// Sample data for testing (matching PDF example)
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
  headers: ["City", "Sales", "Category"],
  rows: SAMPLE_DATA,
  rowCount: SAMPLE_DATA.length,
};

interface DatasetState {
  file: File | null;
  parsedData: ParsedData | null;
  isLoading: boolean;

  setFile: (file: File | null) => void;
  setParsedData: (data: ParsedData | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void; 
  loadSampleData: () => void; // New action to load sample data
}

export const useDatasetStore = create<DatasetState>()(
  devtools(
    (set) => ({
      file: null,
      parsedData: DEFAULT_PARSED_DATA, // Start with sample data
      isLoading: false,

      setFile: (file) => set({ file }),
      setParsedData: (data) => set({ parsedData: data }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Tüm state'i başlangıç durumuna getirir
      reset: () => set({ file: null, parsedData: null, isLoading: false }),
      
      // Load sample data for testing
      loadSampleData: () => set({ parsedData: DEFAULT_PARSED_DATA, file: null }),
    }),
    { name: "DatasetStore" }
  )
);