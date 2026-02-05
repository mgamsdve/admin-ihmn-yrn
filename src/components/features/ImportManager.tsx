"use client";

import React, { useMemo, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { Badge } from "@/src/components/ui/Badge";
import { designSystem } from "@/src/lib/design-system";
import { useToast } from "@/src/hooks/useToast";

export interface ImportField {
  key: string;
  label: string;
  required?: boolean;
  type?: "string" | "email" | "number" | "date";
}

interface ImportManagerProps {
  collectionName: string;
  title: string;
  fields: ImportField[];
  defaultValues?: Record<string, any>;
  transform?: (row: Record<string, any>) => Record<string, any>;
}

const csvSplit = (line: string) => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((value) => value.trim());
};

const normalizeValue = (value: any, type?: ImportField["type"]) => {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  switch (type) {
    case "string":
      return raw;
    case "email":
      return raw.toLowerCase();
    case "number": {
      const num = Number(raw);
      return Number.isNaN(num) ? "" : num;
    }
    case "date":
      return raw;
    default:
      return raw
        .split(" ")
        .map((segment) =>
          segment.length > 0
            ? segment[0].toUpperCase() + segment.slice(1).toLowerCase()
            : segment,
        )
        .join(" ");
  }
};

export function ImportManager({
  collectionName,
  title,
  fields,
  defaultValues = {},
  transform,
}: ImportManagerProps) {
  const { success, error } = useToast();
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length === 0) return;

      const rawHeaders = csvSplit(lines[0]);
      const mappedRows = lines.slice(1).map((line) => {
        const values = csvSplit(line);
        return rawHeaders.reduce<Record<string, string>>((acc, header, idx) => {
          acc[header] = values[idx] || "";
          return acc;
        }, {});
      });

      const defaultMapping: Record<string, string> = {};
      fields.forEach((field) => {
        const match = rawHeaders.find((header) =>
          header.toLowerCase().includes(field.key.toLowerCase()),
        );
        if (match) defaultMapping[field.key] = match;
      });

      setFileName(file.name);
      setHeaders(rawHeaders);
      setRows(mappedRows);
      setMapping(defaultMapping);
    };
    reader.readAsText(file, "utf-8");
  };

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const validation = useMemo(() => {
    const required = fields.filter((field) => field.required);
    const invalidRows: number[] = [];

    rows.forEach((row, idx) => {
      const isInvalid = required.some((field) => {
        const source = mapping[field.key];
        const value = source ? row[source] : "";
        return !String(value || "").trim();
      });

      if (isInvalid) invalidRows.push(idx);
    });

    return {
      total: rows.length,
      invalid: invalidRows.length,
      invalidRows,
    };
  }, [fields, rows, mapping]);

  const handleImport = async () => {
    if (rows.length === 0) return;
    const missingRequired = fields.some(
      (field) => field.required && !mapping[field.key],
    );
    if (missingRequired) {
      error("Veuillez mapper tous les champs requis.");
      return;
    }

    setLoading(true);
    try {
      let imported = 0;
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (skipInvalid && validation.invalidRows.includes(i)) {
          continue;
        }

        const payload = fields.reduce<Record<string, any>>((acc, field) => {
          const source = mapping[field.key];
          const value = source ? row[source] : "";
          acc[field.key] = normalizeValue(value, field.type);
          return acc;
        }, {});

        const merged = {
          ...defaultValues,
          ...payload,
          createdAt: new Date(),
        } as Record<string, any>;

        const finalPayload = transform ? transform(merged) : merged;
        await addDoc(collection(db, collectionName), finalPayload);
        imported += 1;
      }

      success(`${imported} élément(s) importé(s) avec succès`);
      setRows([]);
      setHeaders([]);
      setMapping({});
      setFileName("");
    } catch (err) {
      error("Erreur lors de l'import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
        <div>
          <div style={{ ...designSystem.typography.h4, color: designSystem.colors.text.primary }}>
            {title}
          </div>
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Import CSV avec mapping automatique, validation et normalisation.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: designSystem.spacing.md,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {fileName && <Badge variant="gray">{fileName}</Badge>}
        </div>

        {headers.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: designSystem.spacing.md }}>
            {fields.map((field) => (
              <Select
                key={field.key}
                label={`${field.label}${field.required ? " *" : ""}`}
                value={mapping[field.key] || ""}
                onChange={(value) =>
                  setMapping((prev) => ({ ...prev, [field.key]: value }))
                }
                placeholder="Choisir une colonne"
                options={headers.map((header) => ({ value: header, label: header }))}
              />
            ))}
          </div>
        )}

        {headers.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: designSystem.spacing.sm,
            }}
          >
            <input
              type="checkbox"
              checked={skipInvalid}
              onChange={(e) => setSkipInvalid(e.target.checked)}
            />
            <span style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
              Ignorer les lignes invalides ({validation.invalid} détectées)
            </span>
          </div>
        )}

        {preview.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                ...designSystem.typography.bodySmall,
              }}
            >
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: "left",
                        padding: designSystem.spacing.sm,
                        borderBottom: `1px solid ${designSystem.colors.gray[200]}`,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    {headers.map((header) => (
                      <td
                        key={header}
                        style={{
                          padding: designSystem.spacing.sm,
                          borderBottom: `1px solid ${designSystem.colors.gray[100]}`,
                        }}
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            {validation.total} lignes • {validation.invalid} invalides
          </span>
          <Button variant="primary" onClick={handleImport} loading={loading}>
            Importer
          </Button>
        </div>
      </div>
    </Card>
  );
}
