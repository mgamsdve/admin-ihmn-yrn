import React from "react";
import { designSystem } from "@/src/lib/design-system";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  variant?: "circle" | "square";
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    designSystem.colors.primary[500],
    designSystem.colors.success[500],
    designSystem.colors.warning[500],
    designSystem.colors.danger[500],
    designSystem.colors.info[500],
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({
  name,
  imageUrl,
  size = "md",
  variant = "circle",
}: AvatarProps) {
  const sizePixels = SIZES[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        style={{
          width: sizePixels,
          height: sizePixels,
          borderRadius:
            variant === "circle" ? "50%" : designSystem.borderRadius.md,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: sizePixels,
        height: sizePixels,
        borderRadius:
          variant === "circle" ? "50%" : designSystem.borderRadius.md,
        backgroundColor: getColorFromName(name),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
        fontSize: sizePixels * 0.4,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
