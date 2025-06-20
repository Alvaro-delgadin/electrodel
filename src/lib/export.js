import * as XLSX from "xlsx";

const exportToExcel = (rows, columns, fileName = "tabla.xlsx") => {
  const data = rows.map((row) => {
    const formattedRow = {};
    columns.forEach((col) => {
      // Evitar columnas ocultas
      if (!col.hide) {
        formattedRow[col.headerName] = row[col.field];
      }
    });
    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, fileName);
};

export default exportToExcel;
