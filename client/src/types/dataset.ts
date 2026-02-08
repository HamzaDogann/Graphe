// Column types for data analysis
export type ColumnType = "string" | "number" | "boolean" | "date" | "mixed" | "unknown";

export interface ColumnMetadata {
  name: string;
  type: ColumnType;
  uniqueValues?: number;
  nullCount?: number;
  sampleValues?: any[];
}

export type ParsedData = {
  type: "table" | "json" | "error";
  headers?: string[];
  rows?: Record<string, any>[];
  content?: any;
  fileName: string;
  fileSize: string;
  rowCount?: number;
  columnCount?: number;
  columns?: ColumnMetadata[];
  parsedAt?: string; // ISO timestamp for cache validation
};

// Cache metadata
export interface DatasetCacheInfo {
  fileName: string;
  fileSize: string;
  cachedAt: string;
  expiresAt: string;
  byteSize: number;
}

// Maximum cache size in bytes (5MB)
export const MAX_CACHE_SIZE = 5 * 1024 * 1024;