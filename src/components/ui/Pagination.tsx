import React from "react";
import { designSystem } from "@/src/lib/design-system";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: designSystem.spacing.md,
        marginTop: designSystem.spacing.lg,
        flexWrap: "wrap",
      }}
    >
      {/* Info text */}
      {totalItems && (
        <span
          style={{
            ...designSystem.typography.caption,
            color: designSystem.colors.gray[600],
          }}
        >
          {totalItems} item{totalItems !== 1 ? "s" : ""} total
        </span>
      )}

      {/* Page buttons */}
      <div
        style={{
          display: "flex",
          gap: designSystem.spacing.xs,
          alignItems: "center",
        }}
      >
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: `${designSystem.spacing.xs} ${designSystem.spacing.md}`,
            border: `1px solid ${designSystem.colors.gray[300]}`,
            borderRadius: designSystem.borderRadius.sm,
            backgroundColor:
              currentPage === 1 ? designSystem.colors.gray[100] : "white",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.5 : 1,
            transition: `all ${designSystem.transitions.base}`,
            ...designSystem.typography.caption,
            fontWeight: 500,
          }}
        >
          ← Prev
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..." || page === currentPage}
            style={{
              width: "36px",
              height: "36px",
              border:
                page === currentPage
                  ? `2px solid ${designSystem.colors.primary[600]}`
                  : `1px solid ${designSystem.colors.gray[300]}`,
              borderRadius: designSystem.borderRadius.sm,
              backgroundColor:
                page === currentPage
                  ? designSystem.colors.primary[50]
                  : "white",
              cursor: page === "..." ? "default" : "pointer",
              ...designSystem.typography.caption,
              fontWeight: page === currentPage ? 600 : 400,
              color:
                page === currentPage
                  ? designSystem.colors.primary[600]
                  : designSystem.colors.gray[900],
              transition: `all ${designSystem.transitions.base}`,
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: `${designSystem.spacing.xs} ${designSystem.spacing.md}`,
            border: `1px solid ${designSystem.colors.gray[300]}`,
            borderRadius: designSystem.borderRadius.sm,
            backgroundColor:
              currentPage === totalPages
                ? designSystem.colors.gray[100]
                : "white",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            opacity: currentPage === totalPages ? 0.5 : 1,
            transition: `all ${designSystem.transitions.base}`,
            ...designSystem.typography.caption,
            fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
