import React from "react";
import { designSystem } from "@/src/lib/design-system";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
  error,
}: CheckboxProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: designSystem.spacing.sm,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{
          width: "18px",
          height: "18px",
          cursor: disabled ? "not-allowed" : "pointer",
          accentColor: designSystem.colors.primary[600],
          opacity: disabled ? 0.6 : 1,
        }}
      />
      {label && (
        <label
          style={{
            ...designSystem.typography.body,
            color: error
              ? designSystem.colors.danger[600]
              : designSystem.colors.gray[900],
            cursor: disabled ? "not-allowed" : "pointer",
            userSelect: "none",
          }}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
}
