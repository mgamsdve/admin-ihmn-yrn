import React from "react";
import { designSystem } from "@/src/lib/design-system";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            display: "block",
            ...designSystem.typography.body,
            fontWeight: 500,
            marginBottom: designSystem.spacing.xs,
            color: designSystem.colors.gray[700],
          }}
        >
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={minDate}
        max={maxDate}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
          border: `1px solid ${
            error
              ? designSystem.colors.danger[300]
              : designSystem.colors.gray[300]
          }`,
          borderRadius: designSystem.borderRadius.md,
          backgroundColor: disabled ? designSystem.colors.gray[100] : "white",
          color: designSystem.colors.gray[900],
          ...designSystem.typography.body,
          cursor: disabled ? "not-allowed" : "text",
          transition: `all ${designSystem.transitions.base}`,
          opacity: disabled ? 0.6 : 1,
        }}
      />
      {error && (
        <p
          style={{
            color: designSystem.colors.danger[600],
            ...designSystem.typography.caption,
            marginTop: designSystem.spacing.xs,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
