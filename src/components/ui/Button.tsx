import React from "react";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  transitions,
  shadows,
} from "@/src/lib/design-system";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  isSubmit?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      isSubmit = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles: React.CSSProperties = {
      fontFamily: "inherit",
      fontWeight: 600,
      border: "none",
      borderRadius: borderRadius.base,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      transition: `all ${transitions.fast}`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing[2],
      opacity: disabled || loading ? 0.6 : 1,
      boxShadow: "none",
      ...props.style,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        ...typography.bodySmall,
        padding: `${spacing[2]} ${spacing[3]}`,
        minHeight: "32px",
      },
      md: {
        ...typography.body,
        padding: `${spacing[2]} ${spacing[4]}`,
        minHeight: "40px",
      },
      lg: {
        ...typography.h4,
        padding: `${spacing[3]} ${spacing[5]}`,
        minHeight: "48px",
      },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary[600],
        color: "white",
        boxShadow: shadows.xs,
      },
      secondary: {
        backgroundColor: colors.gray[100],
        color: colors.gray[900],
        border: `1px solid ${colors.gray[300]}`,
      },
      danger: {
        backgroundColor: colors.danger[600],
        color: "white",
        boxShadow: shadows.xs,
      },
      ghost: {
        backgroundColor: "transparent",
        color: colors.primary[600],
      },
    };

    return (
      <button
        ref={ref}
        type={isSubmit ? "submit" : "button"}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          ...variantStyles[variant],
          width: fullWidth ? "100%" : "auto",
        }}
        disabled={disabled || loading}
        onMouseEnter={(e) => {
          if (disabled || loading) return;
          e.currentTarget.style.transform = "translateY(-1px)";
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = colors.primary[700];
            e.currentTarget.style.boxShadow = shadows.sm;
          }
          if (variant === "danger") {
            e.currentTarget.style.backgroundColor = colors.danger[700];
            e.currentTarget.style.boxShadow = shadows.sm;
          }
          if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = colors.gray[50];
          }
          if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = colors.primary[50];
          }
        }}
        onMouseLeave={(e) => {
          if (disabled || loading) return;
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            variant === "primary"
              ? shadows.xs
              : variant === "danger"
                ? shadows.xs
                : "none";
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = colors.primary[600];
          }
          if (variant === "danger") {
            e.currentTarget.style.backgroundColor = colors.danger[600];
          }
          if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }
          if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
        {...props}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: `2px solid ${variant === "secondary" ? colors.gray[900] : "currentColor"}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
            {children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    );
  },
);

Button.displayName = "Button";
