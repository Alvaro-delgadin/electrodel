import { read, utils } from "xlsx";

export const importExcelFile = (file, headerColumnsConfig) => {
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

        // Mapea nombres legibles a keys reales
        const headerMap = {};
        Object.entries(headerColumnsConfig).forEach(([key, config]) => {
          headerMap[config.headerName] = key;
        });

        const adaptedRows = rows.map((row) => {
          const rowData = {};

          header.forEach((label, colIndex) => {
            const trimmedLabel = label.toString().trim();
            const key = headerMap[trimmedLabel];
            const config = headerColumnsConfig[key];

            if (key && config) {
              let value = row[colIndex];

              // 🔄 Transformaciones por tipo
              if (config.type === "number") {
                const parsed = parseFloat(value);
                value = isNaN(parsed) ? null : parsed;
              } else if (config.type === "boolean") {
                value =
                  typeof value === "string"
                    ? value.toLowerCase() === "true" ||
                      value.toLowerCase() === "sí" ||
                      value === "1"
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
                if (value !== null && value !== undefined) {
                  value = String(value);
                }
              }

              rowData[key] = value;
            }
          });

          return rowData;
        });

        // Reglas de validación
        const requiredFields = Object.entries(headerColumnsConfig)
          .filter(([_, config]) => config.nullable === false)
          .map(([key]) => key);

        const positiveNumberFields = Object.entries(headerColumnsConfig)
          .filter(
            ([_, config]) =>
              config.type === "number" && config.nullable === false
          )
          .map(([key]) => key);

        const completeRows = adaptedRows.filter((row) => {
          for (const field of requiredFields) {
            const value = row[field];
            const config = headerColumnsConfig[field];

            if (value === undefined || value === "") return false;

            if (positiveNumberFields.includes(field)) {
              if (typeof value !== "number" || value < 0) return false;
            }
          }
          return true;
        });

        resolve(completeRows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
