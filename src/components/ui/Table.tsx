import React from "react";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "@/src/lib/design-system";

interface Column {
  key: string;
  label: string;
  width?: string | number;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  hideable?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  configKey?: string;
  showPreferences?: boolean;
  density?: "compact" | "comfortable";
  reorderable?: boolean;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyState,
  configKey,
  showPreferences = false,
  density = "comfortable",
  reorderable = true,
}) => {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [showColumns] = React.useState(true);
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({});
  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const resizeRef = React.useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [tableDensity, setTableDensity] = React.useState<
    "compact" | "comfortable"
  >(density);

  const storageKey = configKey ? `ihmn_table_${configKey}` : null;

  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed.columnVisibility) setColumnVisibility(parsed.columnVisibility);
    if (parsed.columnWidths) setColumnWidths(parsed.columnWidths);
    if (parsed.tableDensity) setTableDensity(parsed.tableDensity);
    if (parsed.columnOrder) setColumnOrder(parsed.columnOrder);
  }, [storageKey]);

  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const payload = {
      columnVisibility,
      columnWidths,
      tableDensity,
      columnOrder,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [storageKey, columnVisibility, columnWidths, tableDensity]);

  const handleSelectRow = (id: string) => {
    const newSelected = selectedRows.includes(id)
      ? selectedRows.filter((r) => r !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleSelectAll = () => {
    const newSelected =
      selectedRows.length === data.length ? [] : data.map((row) => row.id);
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  };

  const effectiveColumns = React.useMemo(() => {
    const ordered =
      columnOrder.length > 0
        ? columnOrder
            .map((key) => columns.find((col) => col.key === key))
            .filter(Boolean)
        : columns;

    return ordered.filter((col) => {
      if (col.hideable === false) return true;
      if (columnVisibility[col.key] === false) return false;
      return true;
    });
  }, [columns, columnVisibility, columnOrder]);

  const cellPadding = tableDensity === "compact" ? spacing[2] : spacing[4];

  const handleDragStart = (event: React.DragEvent, key: string) => {
    if (!reorderable) return;
    event.dataTransfer.setData("text/plain", key);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: React.DragEvent, targetKey: string) => {
    if (!reorderable) return;
    event.preventDefault();
    const sourceKey = event.dataTransfer.getData("text/plain");
    if (!sourceKey || sourceKey === targetKey) return;
    const keys = (
      columnOrder.length ? columnOrder : columns.map((c) => c.key)
    ).filter((key) => columns.some((col) => col.key === key));
    const sourceIndex = keys.indexOf(sourceKey);
    const targetIndex = keys.indexOf(targetKey);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const next = [...keys];
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, sourceKey);
    setColumnOrder(next);
  };

  const handleResizeStart = (event: React.MouseEvent, key: string) => {
    event.preventDefault();
    event.stopPropagation();
    const startWidth =
      columnWidths[key] ||
      (typeof columns.find((col) => col.key === key)?.width === "number"
        ? Number(columns.find((col) => col.key === key)?.width)
        : (event.currentTarget.parentElement as HTMLElement)?.offsetWidth ||
          160);
    resizeRef.current = {
      key,
      startX: event.clientX,
      startWidth,
    };
  };

  React.useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = event.clientX - resizeRef.current.startX;
      const nextWidth = Math.max(80, resizeRef.current.startWidth + delta);
      setColumnWidths((prev) => ({
        ...prev,
        [resizeRef.current!.key]: nextWidth,
      }));
    };
    const handleUp = () => {
      resizeRef.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {showPreferences && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing[2],
            marginBottom: spacing[3],
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.md,
            padding: spacing[3],
            backgroundColor: colors.gray[50],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: spacing[3],
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                ...typography.bodySmall,
                color: colors.text.secondary,
              }}
            >
              Personnaliser la vue
            </div>
            <div style={{ display: "flex", gap: spacing[2] }}>
              <button
                type="button"
                onClick={() => setTableDensity("compact")}
                style={{
                  padding: "6px 10px",
                  borderRadius: borderRadius.full,
                  border: `1px solid ${colors.border}`,
                  backgroundColor:
                    tableDensity === "compact" ? colors.gray[200] : "white",
                  cursor: "pointer",
                  ...typography.bodySmall,
                }}
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => setTableDensity("comfortable")}
                style={{
                  padding: "6px 10px",
                  borderRadius: borderRadius.full,
                  border: `1px solid ${colors.border}`,
                  backgroundColor:
                    tableDensity === "comfortable" ? colors.gray[200] : "white",
                  cursor: "pointer",
                  ...typography.bodySmall,
                }}
              >
                Confort
              </button>
            </div>
          </div>
        </div>
      )}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: colors.bgAlt,
          borderRadius: borderRadius.md,
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        {/* Header */}
        <thead>
          <tr
            style={{
              borderBottom: `2px solid ${colors.border}`,
              backgroundColor: colors.gray[100],
            }}
          >
            {selectable && (
              <th style={{ padding: cellPadding, width: "40px" }}>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === data.length && data.length > 0
                  }
                  onChange={handleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
            )}
            {effectiveColumns.map((col) => (
              <th
                key={col.key}
                draggable={reorderable}
                onDragStart={(event) => handleDragStart(event, col.key)}
                onDragOver={(event) => {
                  if (reorderable) event.preventDefault();
                }}
                onDrop={(event) => handleDrop(event, col.key)}
                style={{
                  padding: cellPadding,
                  textAlign: col.align || "left",
                  width: columnWidths[col.key]
                    ? `${columnWidths[col.key]}px`
                    : col.width,
                  minWidth: col.minWidth,
                  maxWidth: col.maxWidth,
                  ...typography.label,
                  color: colors.text.secondary,
                  fontWeight: 600,
                  position: "relative",
                  userSelect: "none",
                  cursor: reorderable ? "grab" : "default",
                }}
              >
                {col.label}
                {col.sortable && " ↕"}
                <span
                  role="separator"
                  aria-orientation="vertical"
                  onMouseDown={(event) => handleResizeStart(event, col.key)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: "8px",
                    cursor: "col-resize",
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={effectiveColumns.length + (selectable ? 1 : 0)}
                style={{
                  padding: spacing[8],
                  textAlign: "center",
                  color: colors.text.secondary,
                  ...typography.body,
                }}
              >
                {emptyState || "Aucune donnée"}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: selectedRows.includes(row.id)
                    ? colors.primary[50]
                    : colors.bgAlt,
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background-color 200ms",
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedRows.includes(
                    row.id,
                  )
                    ? colors.primary[50]
                    : colors.bgAlt;
                }}
              >
                {selectable && (
                  <td style={{ padding: cellPadding, width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(row.id);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                )}
                {effectiveColumns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: cellPadding,
                      textAlign: col.align || "left",
                      width: columnWidths[col.key]
                        ? `${columnWidths[col.key]}px`
                        : col.width,
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth,
                      ...typography.body,
                      color: colors.text.primary,
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] || "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
