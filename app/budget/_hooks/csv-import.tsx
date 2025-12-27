import { parseCSVFile } from "@/lib/csv/parse";
import { ParsedCSVRow } from "@/lib/csv/validate";
import { useState } from "react";

export function useCSVImport() {
  const [csvModalOpen, setCSVModalOpen] = useState(false);
  const [csvData, setCSVData] = useState<Record<string, string | number>[]>([]);
  const [validatedCSVData, setValidatedCSVData] = useState<
    ParsedCSVRow[] | null
  >(null);

  const parseFile = async (file: File | undefined) => {
    if (!file) return { error: "No file selected" };

    try {
      const data = await parseCSVFile(file);
      setCSVData(data);
      setCSVModalOpen(true);
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }

    return { error: null };
  };

  return {
    csvModalOpen,
    setCSVModalOpen,
    csvData,
    setCSVData,
    validatedCSVData,
    setValidatedCSVData,
    parseFile,
  };
}
