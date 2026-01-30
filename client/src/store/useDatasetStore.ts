import { create } from "zustand";
import { ParsedData } from "@/types/dataset";

interface DatasetState {
  file: File | null;
  parsedData: ParsedData | null;
  isLoading: boolean;

  setFile: (file: File | null) => void;
  setParsedData: (data: ParsedData | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void; 
}

export const useDatasetStore = create<DatasetState>((set) => ({
  file: null,
  parsedData: null,
  isLoading: false,

  setFile: (file) => set({ file }),
  setParsedData: (data) => set({ parsedData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Tüm state'i başlangıç durumuna getirir
  reset: () => set({ file: null, parsedData: null, isLoading: false }),
}));