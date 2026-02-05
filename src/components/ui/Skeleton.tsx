import React from "react";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "@/src/lib/design-system";

export const Skeleton: React.FC<{ height?: string; width?: string }> = ({
  height = "16px",
  width = "100%",
}) => {
  return (
    <div
      style={{
        height,
        width,
        backgroundColor: colors.gray[200],
        borderRadius: borderRadius.base,
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export const SkeletonRow: React.FC<{ columns: number }> = ({ columns }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: spacing[3],
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
};
