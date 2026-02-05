import React, { useState } from "react";
import { designSystem } from "@/src/lib/design-system";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  label,
  error,
  placeholder,
  disabled,
}: SelectProps) {
  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = designSystem.colors.primary[500];
    e.currentTarget.style.boxShadow = `0 0 0 4px ${designSystem.colors.primary[100]}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = error
      ? designSystem.colors.danger[300]
      : designSystem.colors.gray[300];
    e.currentTarget.style.boxShadow = "none";
  };

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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
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
          cursor: disabled ? "not-allowed" : "pointer",
          transition: `all ${designSystem.transitions.base}`,
          opacity: disabled ? 0.6 : 1,
          boxShadow: "none",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
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
