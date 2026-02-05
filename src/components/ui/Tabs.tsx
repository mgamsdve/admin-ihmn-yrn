import React, { useState, ReactNode } from "react";
import { designSystem } from "@/src/lib/design-system";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  badge?: number;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ items, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = items.find((item) => item.id === activeTab);

  return (
    <div style={{ width: "100%" }}>
      {/* Tab buttons */}
      <div
        style={{
          display: "flex",
          borderBottom: `2px solid ${designSystem.colors.gray[200]}`,
          marginBottom: designSystem.spacing.md,
          gap: designSystem.spacing.xs,
          overflowX: "auto",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            style={{
              ...designSystem.typography.body,
              padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color:
                activeTab === item.id
                  ? designSystem.colors.primary[600]
                  : designSystem.colors.gray[600],
              borderBottom:
                activeTab === item.id
                  ? `2px solid ${designSystem.colors.primary[600]}`
                  : "transparent",
              marginBottom: "-2px",
              fontWeight: activeTab === item.id ? 600 : 400,
              transition: `all ${designSystem.transitions.base}`,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: designSystem.spacing.xs,
            }}
          >
            {item.label}
            {item.badge !== undefined && (
              <span
                style={{
                  ...designSystem.typography.caption,
                  padding: `0 ${designSystem.spacing.xs}`,
                  backgroundColor: designSystem.colors.danger[100],
                  color: designSystem.colors.danger[600],
                  borderRadius: designSystem.borderRadius.full,
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ minHeight: "200px" }}>{activeContent?.content}</div>
    </div>
  );
}
