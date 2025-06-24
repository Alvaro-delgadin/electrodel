import { read, utils } from "xlsx";

export default async function readExcelFile(file, columns) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileBuffer = event.target.result;
        const workbook = read(new Uint8Array(fileBuffer), { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const filteredData = data.filter((row) =>
          row.some((cell) => cell !== "")
        );

        if (filteredData.length === 0) {
          throw new Error("El archivo está vacío o no contiene datos válidos.");
        }

        const validColumns = filteredData[0]
          .map((col, index) => (col !== "" ? index : null))
          .filter((index) => index !== null);

        const cleanedData = filteredData.map((row) =>
          validColumns.map((index) => row[index])
        );

        const header = cleanedData[0];
        const rows = cleanedData.slice(1);

        // === Mapeo flexible: normaliza los headerName del Excel y los de columns ===
        const normalize = (str) =>
          String(str).trim().toLowerCase().replace(/\s+/g, "");

        const headerMap = {};
        columns.forEach((col) => {
          if (col.headerName && col.field) {
            headerMap[normalize(col.headerName)] = col.field;
          }
        });

        const columnConfigs = Object.fromEntries(
          columns.map((col) => [col.field, col])
        );

        const adaptedRows = rows.map((row, rowIndex) => {
          const rowData = {};
          const errors = [];

          header.forEach((label, colIndex) => {
            const normalizedLabel = normalize(label);
            const key = headerMap[normalizedLabel];
            const config = columnConfigs[key];

            if (key && config) {
              let value = row[colIndex];

              // 🔄 Transformación según tipo
              if (config.type === "number") {
                if (typeof value === "string") {
                  value = value
                    .replace(/[^\d,.-]/g, "")
                    .replace(/\.(?=\d{3})/g, "")
                    .replace(",", ".");
                }
                const parsed = parseFloat(value);
                value = isNaN(parsed) ? null : parsed;
              } else if (config.type === "boolean") {
                value =
                  typeof value === "string"
                    ? ["true", "sí", "si", "1"].includes(value.toLowerCase())
                    : Boolean(value);
              } else if (key === "images") {
                value =
                  typeof value === "string"
                    ? value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean)
                    : Array.isArray(value)
                    ? value
                    : [];
              } else if (config.type === "text" || config.type === "string") {
                value = value != null ? String(value) : "";
              }

              rowData[key] = value;
            }
          });

          return { rowData, originalRow: row, rowIndex };
        });

        // === Validación por campo ===
        const requiredFields = columns
          .filter((col) => col.nullable === false)
          .map((col) => col.field);

        const positiveNumberFields = columns
          .filter((col) => col.type === "number" && col.nullable === false)
          .map((col) => col.field);

        const completeRows = [];
        const invalidRows = [];

        for (const { rowData, originalRow, rowIndex } of adaptedRows) {
          const errors = [];

          for (const field of requiredFields) {
            const value = rowData[field];
            if (value === undefined || value === "") {
              errors.push(`Campo requerido: "${field}"`);
            }

            if (
              positiveNumberFields.includes(field) &&
              (typeof value !== "number" || value < 0)
            ) {
              errors.push(`"${field}" debe ser un número positivo`);
            }
          }

          if (errors.length > 0) {
            invalidRows.push({ rowIndex, originalRow, errors });
          } else {
            completeRows.push(rowData);
          }
        }

        resolve({ validRows: completeRows, invalidRows });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
