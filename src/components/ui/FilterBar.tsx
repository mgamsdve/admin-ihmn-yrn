import React from "react";
import { designSystem } from "@/src/lib/design-system";

interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClear: () => void;
  filterConfig: Array<{
    key: string;
    label: string;
    type: "text" | "select" | "date" | "multiselect";
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
  }>;
}

export function FilterBar({
  filters,
  onFilterChange,
  onClear,
  filterConfig,
}: FilterBarProps) {
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "" && v !== null && v !== undefined,
  ).length;

  return (
    <div
      style={{
        backgroundColor: designSystem.colors.gray[50],
        border: `1px solid ${designSystem.colors.gray[200]}`,
        borderRadius: designSystem.borderRadius.md,
        padding: designSystem.spacing.md,
        marginBottom: designSystem.spacing.md,
      }}
    >
      {/* Filter controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: designSystem.spacing.md,
        }}
      >
        {filterConfig.map((config) => (
          <div key={config.key}>
            <label
              style={{
                display: "block",
                ...designSystem.typography.caption,
                fontWeight: 600,
                marginBottom: designSystem.spacing.xs,
                color: designSystem.colors.gray[600],
              }}
            >
              {config.label}
            </label>
            {config.type === "text" && (
              <input
                type="text"
                placeholder={config.placeholder}
                value={filters[config.key] || ""}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.sm,
                  ...designSystem.typography.body,
                }}
              />
            )}
            {config.type === "select" && config.options && (
              <select
                value={filters[config.key] || ""}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.sm,
                  ...designSystem.typography.body,
                }}
              >
                <option value="">All</option>
                {config.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {config.type === "date" && (
              <input
                type="date"
                value={filters[config.key] || ""}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.sm,
                  ...designSystem.typography.body,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div
          style={{
            marginTop: designSystem.spacing.md,
            paddingTop: designSystem.spacing.md,
            borderTop: `1px solid ${designSystem.colors.gray[200]}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              ...designSystem.typography.caption,
              color: designSystem.colors.gray[600],
            }}
          >
            {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
            active
          </span>
          <button
            onClick={onClear}
            style={{
              padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
              backgroundColor: designSystem.colors.gray[200],
              border: "none",
              borderRadius: designSystem.borderRadius.sm,
              ...designSystem.typography.caption,
              cursor: "pointer",
              fontWeight: 500,
              color: designSystem.colors.gray[700],
              transition: `all ${designSystem.transitions.base}`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                designSystem.colors.gray[300];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                designSystem.colors.gray[200];
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
