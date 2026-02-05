import React, { ReactNode } from "react";
import { designSystem } from "@/src/lib/design-system";

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isExpandable?: boolean;
  metadata?: Record<string, any>;
  onAction?: (nodeId: string, action: string) => void;
}

interface TreeViewProps {
  nodes: TreeNode[];
  defaultExpanded?: string[];
  onNodeClick?: (nodeId: string) => void;
  renderNode?: (node: TreeNode, level: number) => ReactNode;
  storageKey?: string;
}

export function TreeView({
  nodes,
  defaultExpanded = [],
  onNodeClick,
  renderNode,
  storageKey,
}: TreeViewProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    new Set(defaultExpanded),
  );

  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setExpanded(new Set(parsed));
      } catch {
        // ignore invalid data
      }
    }
  }, [storageKey]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpanded(newExpanded);
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(newExpanded)),
      );
    }
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: `${level * 20}px`,
            paddingTop: designSystem.spacing.xs,
            paddingBottom: designSystem.spacing.xs,
            paddingRight: designSystem.spacing.sm,
            cursor: onNodeClick ? "pointer" : "default",
            backgroundColor: "transparent",
            transition: `background-color ${designSystem.transitions.fast}, transform ${designSystem.transitions.fast}`,
            borderRadius: designSystem.borderRadius.sm,
            gap: designSystem.spacing.xs,
          }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(node.id);
            }
            onNodeClick?.(node.id);
          }}
          onMouseEnter={(e) => {
            if (onNodeClick) {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                designSystem.colors.primary[50];
              (e.currentTarget as HTMLElement).style.transform =
                "translateX(2px)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
          }}
        >
          {hasChildren && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: `transform ${designSystem.transitions.fast}`,
              }}
            >
              ▶
            </span>
          )}
          {!hasChildren && <span style={{ width: "20px" }}></span>}

          <div
            style={{
              ...designSystem.typography.body,
              color: designSystem.colors.gray[900],
              flex: 1,
            }}
          >
            {renderNode ? renderNode(node, level) : <span>{node.label}</span>}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        border: `1px solid ${designSystem.colors.gray[200]}`,
        borderRadius: designSystem.borderRadius.md,
        padding: designSystem.spacing.md,
        backgroundColor: "white",
      }}
    >
      {nodes.map((node) => renderTreeNode(node))}
    </div>
  );
}
