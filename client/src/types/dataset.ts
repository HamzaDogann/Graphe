export type ParsedData = {
  type: "table" | "json" | "error";
  headers?: string[];
  rows?: any[];
  content?: any;
  fileName: string;
  fileSize: string;
};