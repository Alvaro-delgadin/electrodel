import * as XLSX from "xlsx";

export default function exportToExcel(rows, columns, fileName = "tabla.xlsx") {
  const data = rows.map((row) => {
    const formattedRow = {};

    columns.forEach((col) => {
      const { field, headerName, hide } = col;

      if (!hide && field !== "actions") {
        formattedRow[headerName] = row[field];
      }
    });

    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, fileName);
}
