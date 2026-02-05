"use client";

import React, { useState } from "react";
import { designSystem } from "@/src/lib/design-system";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";

interface ExportManagerProps {
  data: any[];
  fileName?: string;
  columns?: string[];
}

export function ExportManager({
  data,
  fileName = "export",
  columns,
}: ExportManagerProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv");

  const exportAsCSV = () => {
    if (!data || data.length === 0) return;

    const headers = columns || Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value || "");
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadFile(blob, `${fileName}.csv`);
  };

  const exportAsExcel = () => {
    // Simplified: use CSV format with .xlsx extension
    // For proper Excel, would need a library like xlsx
    exportAsCSV();
    alert(
      "For full Excel formatting, please use a backend service or xlsx library",
    );
  };

  const exportAsPDF = () => {
    alert(
      "PDF export requires a backend service or library like pdfkit. Implement as needed.",
    );
  };

  const downloadFile = (blob: Blob, name: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (format) {
      case "csv":
        exportAsCSV();
        break;
      case "excel":
        exportAsExcel();
        break;
      case "pdf":
        exportAsPDF();
        break;
    }
  };

  return (
    <Card>
      <div
        style={{
          display: "flex",
          gap: designSystem.spacing.md,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e as any)}
          options={[
            { value: "csv", label: "CSV" },
            { value: "excel", label: "Excel" },
            { value: "pdf", label: "PDF" },
          ]}
        />

        <Button variant="primary" onClick={handleExport}>
          Export ({data?.length || 0} items)
        </Button>
      </div>
    </Card>
  );
}
