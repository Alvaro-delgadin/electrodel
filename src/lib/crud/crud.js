import { v4 as uuidv4 } from "uuid";
import readExcelFile from "@/lib/excel/import";
import validateCellChange from "../validations/validateCellChange";
import validateNewRowRequired from "../validations/validateNewRowRequired";
import validateNewRowNegative from "../validations/validateNewRowNegative";
import validateRowIsDuplicate from "../validations/validateRowIsDuplicate";
export function createActions(
  table,
  item,
  supabase,
  apiRef,
  setSync,
  setError,
  requestLock,
  columns,
  rows,
  rowsSelected,
  selectedRowModal,
  setSelectedRowModal,
  categories
) {
  return {
    addRow(row) {
      const id = `new-${uuidv4()}`;

      let newRow = {
        id,
        isNew: true,
        active: true,
      };

      if (row) {
        newRow = {
          ...newRow,
          product: row.product || "",
          category: row.category || "",
          subcategory: row.subcategory || "",
          stock: row.stock || "",
          images: row.images || "",
        };
      }
      columns.forEach((col) => {
        if (col.field === "id") return;

        if (newRow[col.field] === undefined) {
          newRow[col.field] =
            "default" in col
              ? col.default
              : col.type === "number"
              ? 0
              : col.type === "boolean"
              ? true
              : "";
        }
      });

      apiRef.current?.updateRows([newRow]);
    },
    cancelNewRow(id) {
      setError(false);
      apiRef.current.updateRows([{ id, _action: "delete" }]);
    },
    async rowUpdate(newRow, oldRow) {
      setError(null);
      if (newRow.category !== oldRow.category) {
        const cat = categories.find((c) => c.category === newRow.category);
        const validSubs = cat ? cat.subcategories : [];

        if (!validSubs.includes(newRow.subcategory)) {
          apiRef.current.updateRows([{ ...newRow, subcategory: "" }]);
        }
      }
      if (requestLock.current) return;
      if (newRow.isNew) {
        return { ...newRow };
      }
      try {
        setSync(true);
        requestLock.current = true;

        const changedField = Object.keys(newRow).find(
          (key) => newRow[key] !== oldRow[key]
        );
        if (!changedField) {
          setSync(false);
          return oldRow;
        }

        const updatedValue = newRow[changedField];
        const fieldConfig = columns.find(
          (column) => column.field === changedField
        );

        validateCellChange(fieldConfig, updatedValue);
        if (table === "products") validateRowIsDuplicate(newRow, rows);
        setSync("Actualizando");
        apiRef.current.updateRows([newRow]);
        const { error } = await supabase
          .from(table)
          .update({ [changedField]: updatedValue })
          .eq("id", newRow.id);

        if (error) throw new Error("Error al actualizar " + error.message);
        return newRow;
      } catch (err) {
        setError(err.message);
        return oldRow;
      } finally {
        setSync(false);
        requestLock.current = false;
      }
    },
    async saveNewRow(row) {
      setError(false);
      try {
        validateNewRowRequired(columns, row);
        validateNewRowNegative(columns, row);
        if (table === "products") validateRowIsDuplicate(row, rows);
        if (requestLock.current) return;
        requestLock.current = true;
        setSync(`Subiendo nuevo ${item}`);
        const { actions, id, isNew, created_at, ...newProduct } = row;

        if (table === "products") {
          newProduct.images = !newProduct.images ? [] : newProduct.images;
        }
        const { error, data } = await supabase
          .from(table)
          .insert([newProduct])
          .select();

        if (error) throw error;
        apiRef.current.updateRows([{ id: row.id, _action: "delete" }]);
        const insertedRow = data?.[0];
        if (!insertedRow)
          throw new Error(`No se pudo obtener el ${item} creado`);
        if (table !== "orders") apiRef.current.updateRows([insertedRow]);
      } catch (err) {
        setError(err.message);
      } finally {
        setSync(false);
        requestLock.current = false;
      }
    },
    async deleteRow(id) {
      setError(null);
      if (requestLock.current) return;
      requestLock.current = true;
      try {
        setSync(true);
        // Actualizar en Supabase
        apiRef.current.updateRows([{ id, _action: "delete" }]);
        const { error } = await supabase
          .from(table)
          .update({ active: false })
          .eq("id", id);
        if (error) throw error;
        return;
      } catch (err) {
        setError(err.message);
        return oldRow;
      } finally {
        setSync(false);
        requestLock.current = false;
      }
    },
    async deleteImage(event, index) {
      event.stopPropagation();
      if (requestLock.current) return;
      requestLock.current = true;

      setSync("Eliminando imagen");
      const updated = [...(selectedRowModal.images || [])];
      updated.splice(index, 1); // elimina la imagen

      apiRef.current.updateRows([{ id: selectedRowModal.id, images: updated }]);
      setSelectedRowModal((prev) => {
        return { ...prev, images: updated };
      });

      try {
        if (selectedRowModal.isNew) {
          return;
        }
        const hasBlob = selectedRowModal.images.filter((img) =>
          img.includes("blob")
        );

        if (hasBlob?.length) {
          throw new Error("url con Blob");
        }
        const basePath = "/storage/v1/object/public/";
        const pathIndex = selectedRowModal.images[index].indexOf(basePath);
        if (pathIndex !== -1) {
          const pathWithBucket = selectedRowModal.images[index].slice(
            pathIndex + basePath.length
          );
          const [bucket, ...pathParts] = pathWithBucket.split("/");
          const filePath = pathParts.join("/");

          const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          if (error) {
            throw new Error(error.message);
          }
        }
        const { updateError } = await supabase
          .from(table)
          .update({ images: updated })
          .eq("id", selectedRowModal.id);
        if (updateError)
          throw new Error(
            "Error al actualizar la imagen: " + updateError.message
          );
      } catch (err) {
        setError(err.message);
      } finally {
        setSync(false);
        requestLock.current = false;
      }
    },
    async uploadImage(file, index) {
      if (!file || index === undefined || index === null) return;

      if (requestLock.current) return;
      requestLock.current = true;
      setSync("Subiendo imagen");
      setError(false);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `product_${Date.now()}.${fileExt}`;
        const filePath = `product-image/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("assets")
          .upload(filePath, file);
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        setSync("Obteniendo url de la imagen");
        const { data, bucketError } = supabase.storage
          .from("assets")
          .getPublicUrl(filePath);
        const publicUrl = data.publicUrl;
        if (bucketError) {
          throw new Error("Error al buscar la imagen: " + bucketError.message);
        }
        const updated = [...selectedRowModal.images];
        updated[index] = publicUrl;
        apiRef.current.updateRows([
          { id: selectedRowModal.id, images: updated },
        ]);
        setSelectedRowModal((prev) => {
          return { ...prev, images: updated };
        });
        if (selectedRowModal.isNew) {
          return;
        }
        setSync("Actualizando Base de datos");
        const { response, updateError } = await supabase
          .from(table)
          .update({ images: updated })
          .eq("id", selectedRowModal.id);

        if (updateError) {
          throw new Error(
            "Error al actualizar la imagen: " + updateError.message
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setSync(false);
        requestLock.current = false;
      }
    },
    async setRowsValue(field, value) {
      if (requestLock.current) return;
      requestLock.current = true;
      setSync(true);
      setError(false);

      rowsSelected.forEach((rowId) => {
        apiRef.current.updateRows([{ id: rowId, [field]: value }]);
      });
      const updates = rowsSelected.map((id) =>
        supabase
          .from("products")
          .update({ [field]: value })
          .eq("id", id)
      );
      try {
        const results = await Promise.all(updates);
        const hasError = results.some((res) => res.error);
        if (hasError) {
          throw new Error("Error actualizando algunos registros");
        }
      } catch (error) {
        setError(error);
      } finally {
        setSync(false);
        requestLock.current = false;
      }
    },
    async importFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      const fileName = file.name.toLowerCase();
      setError(false);
      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        setError("Formato no válido. Usá un archivo Excel (.xlsx, .xls)");
        setSync(false);
        return;
      }

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        try {
          setSync("Importando archivo Excel");
          const { validRows, invalidRows } = await readExcelFile(file, columns);
          if (invalidRows.length) console.error(invalidRows);
          const rowsToUpdate = validRows.filter((importedRow) =>
            rows.some(
              (existingRow) => existingRow.product === importedRow.product
            )
          );
          if (rowsToUpdate?.length) {
            const formatedUpdateRows = rowsToUpdate.map((row) => ({
              ...row,
              price:
                typeof row.price === "string"
                  ? parseFloat(
                      row.price
                        .replace(/[^\d,.-]/g, "")
                        .replace(/\.(?=\d{3})/g, "")
                        .replace(",", ".")
                    )
                  : row.price,
            }));
            if (table === "products") {
              const updates = formatedUpdateRows.map((row) =>
                supabase.from("products").update(row).eq("product", row.product)
              );
              setSync("Actualizando base de datos");
              const { error: updateError } = await Promise.all(updates);
              formatedUpdateRows.forEach((row) =>
                apiRef.current.updateRows([row])
              );
              if (updateError) {
                throw new Error("Error al actualizar base de datos");
              }
            }
          }
          if (table === "products") {
            const newRows = validRows.filter(
              (importedRow) =>
                !rows.some(
                  (existingRow) =>
                    existingRow.product === importedRow.product ||
                    existingRow.id === importedRow.id
                )
            );

            if (newRows?.length) {
              setSync("Subiendo los nuevos productos");
              const formatedNewRows = newRows.map((row) => ({
                ...row,
                price:
                  typeof row.price === "string"
                    ? parseFloat(
                        row.price
                          .replace(/[^\d,.-]/g, "")
                          .replace(/\.(?=\d{3})/g, "")
                          .replace(",", ".")
                      )
                    : row.price,
              }));

              const { data, error: uploadError } = await supabase
                .from("products")
                .insert(formatedNewRows)
                .select();

              if (uploadError) {
                throw new Error(
                  "Error al agregar productos a la base de datos"
                );
              }

              const insertedRows = data;
              if (!insertedRows) {
                throw new Error(`No se pudo obtener el ${item} creado`);
              }

              insertedRows.forEach((row) => apiRef.current.updateRows([row]));
            }
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setSync(false);
        }
      }
    },
  };
}
