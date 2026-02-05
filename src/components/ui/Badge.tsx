import React from "react";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "@/src/lib/design-system";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "danger" | "warning" | "gray";
  size?: "sm" | "md";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "primary", size = "sm", children, ...props }, ref) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      primary: { bg: colors.primary[50], text: colors.primary[700] },
      success: { bg: colors.success[50], text: colors.success[700] },
      danger: { bg: colors.danger[50], text: colors.danger[700] },
      warning: { bg: colors.warning[50], text: colors.warning[700] },
      gray: { bg: colors.gray[100], text: colors.gray[700] },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        ...typography.bodyTiny,
        padding: `${spacing[1]} ${spacing[2]}`,
      },
      md: {
        ...typography.bodySmall,
        padding: `${spacing[1]} ${spacing[3]}`,
      },
    };

    const { bg, text } = colorMap[variant];

    return (
      <span
        ref={ref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          color: text,
          borderRadius: borderRadius.full,
          fontWeight: 600,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
          ...sizeStyles[size],
          ...props.style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
