import Papa from "papaparse";

export async function parseCSVFile(file: File): Promise<Record<string, string | number>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        // Convert array of arrays to array of objects with generic keys
        const headers = results.data[0] as string[];
        const rows = (results.data as any[]).slice(1).map((row) => {
          const obj: Record<string, string | number> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || "";
          });
          return obj;
        });
        resolve(rows);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
