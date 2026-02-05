import React from "react";
import { colors, spacing, typography } from "@/src/lib/design-system";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    return (
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <input
          ref={ref}
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: "100%",
            padding: `${spacing[2]} ${spacing[4]} ${spacing[2]} ${spacing[10]}`,
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            ...typography.body,
            fontFamily: "inherit",
            backgroundColor: colors.bgAlt,
            boxShadow: "none",
            transition: "all 180ms ease",
          }}
          placeholder="Rechercher..."
          {...props}
        />
        <span
          style={{
            position: "absolute",
            left: spacing[3],
            color: colors.text.secondary,
            fontSize: "18px",
          }}
        >
          🔍
        </span>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
