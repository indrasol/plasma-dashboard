import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exports JSON data to downloadable CSV file via browser.
 *
 * @param data - Array of objects representing rows.
 * @param filename - Name of the output CSV file.
 */
export function exportToCSV(data: unknown[], filename = "data.csv"): void {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate buffer & create Blob for download
    const csvBuffer = XLSX.write(workbook, {
      bookType: "csv",
      type: "array"
    });

    const blob = new Blob([csvBuffer], {
      type: "text/csv;charset=utf-8;"
    });

    saveAs(blob, filename);
  } catch (err) {
    console.error("❌ Failed to export CSV:", err);
  }
}

