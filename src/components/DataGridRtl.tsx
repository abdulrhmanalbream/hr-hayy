"use client";
import { useMemo } from "react";
import { DataGrid, type DataGridProps, type GridColDef, type GridComparatorFn } from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import Box from "@mui/material/Box";
import { compareNaturalAny } from "@/lib/naturalSort";

const naturalComparator: GridComparatorFn = (a, b) => compareNaturalAny(a, b);
const TYPED_COLUMNS = new Set(["number", "date", "dateTime", "boolean", "actions"]);

function withNaturalSort(columns: readonly GridColDef[]): GridColDef[] {
  return columns.map((col) => {
    if (col.sortComparator || col.sortable === false) return col;
    if (col.type && TYPED_COLUMNS.has(col.type)) return col;
    return { ...col, sortComparator: naturalComparator };
  });
}

/** RTL-ready DataGrid with Arabic locale and brand styling. */
export default function DataGridRtl({ sx, columns, ...props }: DataGridProps) {
  const sortedColumns = useMemo(() => withNaturalSort(columns), [columns]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 0,
        "& .MuiDataGrid-root": {
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          borderRadius: 2.5,
        },
        "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": { bgcolor: "background.default" },
        "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
        "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
      }}
    >
      <DataGrid
        columns={sortedColumns}
        localeText={arSD.components.MuiDataGrid.defaultProps.localeText}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        sx={{ width: "100%", ...sx }}
        {...props}
      />
    </Box>
  );
}
