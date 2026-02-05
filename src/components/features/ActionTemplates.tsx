"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { designSystem } from "@/src/lib/design-system";

interface ActionTemplate {
  id: string;
  title: string;
  description: string;
  apply: () => void;
}

interface ActionTemplatesProps {
  templates: ActionTemplate[];
}

export function ActionTemplates({ templates }: ActionTemplatesProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: designSystem.spacing.md,
        }}
      >
        <div>
          <div style={{ ...designSystem.typography.h3, color: designSystem.colors.text.primary }}>
            Templates d'actions
          </div>
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Exécutez des scénarios fréquents en un clic.
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Masquer" : "Afficher"}
        </Button>
      </div>

      {expanded && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: designSystem.spacing.md,
            marginTop: designSystem.spacing.md,
          }}
        >
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                border: `1px solid ${designSystem.colors.gray[200]}`,
                borderRadius: designSystem.borderRadius.md,
                padding: designSystem.spacing.md,
                display: "flex",
                flexDirection: "column",
                gap: designSystem.spacing.sm,
              }}
            >
              <div style={{ ...designSystem.typography.h4, color: designSystem.colors.text.primary }}>
                {template.title}
              </div>
              <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                {template.description}
              </div>
              <Button variant="secondary" size="sm" onClick={template.apply}>
                Lancer
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
