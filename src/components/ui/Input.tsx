import React from "react";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  transitions,
} from "@/src/lib/design-system";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ label, error, hint, icon, multiline, rows, ...props }, ref) => {
  const sharedStyles: React.CSSProperties = {
    ...typography.body,
    width: "100%",
    padding: `${spacing[3]} ${spacing[4]}`,
    paddingLeft: icon ? spacing[10] : spacing[4],
    border: `1px solid ${error ? colors.danger[400] : colors.border}`,
    borderRadius: borderRadius.base,
    backgroundColor: colors.bgAlt,
    color: colors.text.primary,
    transition: `all ${transitions.fast}`,
    boxShadow: error ? `0 0 0 3px ${colors.danger[50]}` : "none",
    fontFamily: "inherit",
  };

  const sharedHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = colors.primary[500];
      e.currentTarget.style.boxShadow = `0 0 0 4px ${colors.primary[100]}`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!error) {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = "none";
      }
    },
  };

  const inputProps = props as React.InputHTMLAttributes<HTMLInputElement>;
  const textareaProps = props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>;

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            ...typography.label,
            color: colors.text.primary,
            display: "block",
            marginBottom: spacing[2],
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon && (
          <span
            style={{
              position: "absolute",
              left: spacing[3],
              color: colors.gray[400],
            }}
          >
            {icon}
          </span>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            style={sharedStyles}
            {...sharedHandlers}
            {...textareaProps}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            style={sharedStyles}
            {...sharedHandlers}
            {...inputProps}
          />
        )}
      </div>
      {error && (
        <p
          style={{
            ...typography.bodySmall,
            color: colors.danger[600],
            marginTop: spacing[1],
          }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            ...typography.bodySmall,
            color: colors.gray[500],
            marginTop: spacing[1],
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
