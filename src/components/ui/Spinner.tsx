import React from "react";
import { colors } from "@/src/lib/design-system";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = colors.primary[600],
}) => {
  const sizeMap: Record<string, string> = {
    sm: "16px",
    md: "24px",
    lg: "32px",
  };

  return (
    <div
      style={{
        display: "inline-block",
        width: sizeMap[size],
        height: sizeMap[size],
        border: `3px solid ${colors.gray[200]}`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
