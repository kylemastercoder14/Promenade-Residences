import { ColumnDef } from "@tanstack/react-table";

export interface PrintColumn {
  header: string;
  accessor: string | ((row: any) => string | number | null | undefined);
}

/**
 * Extracts print-friendly columns from TanStack Table column definitions
 * Excludes action columns and converts complex cells to simple text
 */
export const extractPrintColumns = <T,>(
  columns: ColumnDef<T>[],
  excludeColumns: string[] = ["actions", "action"]
): PrintColumn[] => {
  return columns
    .filter((col) => {
      const accessorKey = (col as any).accessorKey as string | undefined;
      return accessorKey && !excludeColumns.includes(accessorKey);
    })
    .map((col) => {
      const accessorKey = (col as any).accessorKey as string | undefined;
      const header = typeof col.header === "function"
        ? (col.header as any)({ column: {} })?.props?.children || "Column"
        : (col.header as string) || "Column";

      // Extract header text from React elements
      let headerText = "";
      if (typeof header === "string") {
        headerText = header;
      } else if (header?.props?.children) {
        headerText = typeof header.props.children === "string"
          ? header.props.children
          : header.props.children?.props?.children || "Column";
      }

      return {
        header: headerText || accessorKey || "Column",
        accessor: accessorKey || "",
      };
    });
};

/**
 * Gets a simple text value from a row for printing
 */
export const getPrintValue = (row: any, accessor: string): string => {
  const value = row[accessor];
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value.name) return value.name;
    if (value.firstName && value.lastName) {
      return `${value.firstName} ${value.lastName}`.trim();
    }
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
};

