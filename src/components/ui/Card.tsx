import React from "react";
import {
  colors,
  spacing,
  shadows,
  borderRadius,
  transitions,
} from "@/src/lib/design-system";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: "default" | "elevated";
  padding?: keyof typeof spacing;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      hoverable = false,
      variant = "default",
      padding,
      children,
      ...props
    },
    ref,
  ) => {
    const isElevated = variant === "elevated";
    const paddingValue =
      padding === undefined
        ? `var(--ihmn-card-padding, ${spacing[6]})`
        : spacing[padding as keyof typeof spacing];

    return (
      <div
        ref={ref}
        style={{
          backgroundColor: colors.bgAlt,
          borderRadius: borderRadius.md,
          border: variant === "default" ? `1px solid ${colors.border}` : "none",
          boxShadow: isElevated ? shadows.sm : "none",
          padding: paddingValue,
          transition: `all ${transitions.base}`,
          cursor: hoverable ? "pointer" : "default",
          ...props.style,
        }}
        onMouseEnter={(e) => {
          if (hoverable) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = shadows.md;
          }
        }}
        onMouseLeave={(e) => {
          if (hoverable) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = isElevated ? shadows.sm : "none";
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
