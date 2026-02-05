"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { designSystem } from "@/src/lib/design-system";
import { useRouter } from "next/router";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "danger" | "success";
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationsCenterProps {
  studentStats: {
    missingEmail: number;
    missingPhone: number;
    missingYear: number;
  };
  professorStats: {
    missingEmail: number;
    missingPhone: number;
    missingSpec: number;
  };
}

export function NotificationsCenter({
  studentStats,
  professorStats,
}: NotificationsCenterProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("ihmn_notifications");
    if (saved) {
      setDismissed(JSON.parse(saved));
    }
  }, []);

  const saveDismissed = (next: Record<string, boolean>) => {
    setDismissed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ihmn_notifications", JSON.stringify(next));
    }
  };

  const notifications: NotificationItem[] = useMemo(
    () => [
      {
        id: "students-missing-email",
        title: "Étudiants sans email",
        description: `${studentStats.missingEmail} profil(s) à compléter.`,
        severity: "warning",
        actionLabel: "Corriger",
        onAction: () => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "ihmn_students_view_autoload",
              JSON.stringify({ quickFilter: "missingEmail" }),
            );
          }
          router.push("/students");
        },
      },
      {
        id: "students-missing-year",
        title: "Année manquante",
        description: `${studentStats.missingYear} étudiant(s) sans année.`,
        severity: "danger",
        actionLabel: "Mettre à jour",
        onAction: () => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "ihmn_students_view_autoload",
              JSON.stringify({ quickFilter: "missingYear" }),
            );
          }
          router.push("/students");
        },
      },
      {
        id: "professors-missing-spec",
        title: "Spécialités manquantes",
        description: `${professorStats.missingSpec} professeurs sans spécialité.`,
        severity: "warning",
        actionLabel: "Corriger",
        onAction: () => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "ihmn_professors_view_autoload",
              JSON.stringify({ quickFilter: "missingSpec" }),
            );
          }
          router.push("/professors");
        },
      },
      {
        id: "professors-missing-email",
        title: "Professeurs sans email",
        description: `${professorStats.missingEmail} profil(s) à compléter.`,
        severity: "warning",
        actionLabel: "Corriger",
        onAction: () => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "ihmn_professors_view_autoload",
              JSON.stringify({ quickFilter: "missingEmail" }),
            );
          }
          router.push("/professors");
        },
      },
    ],
    [professorStats, router, studentStats],
  );

  const visibleNotifications = notifications.filter(
    (item) => !dismissed[item.id],
  );

  const getBadgeVariant = (severity: NotificationItem["severity"]) => {
    switch (severity) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "gray";
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: designSystem.spacing.sm }}>
        <div style={{ ...designSystem.typography.h3, color: designSystem.colors.text.primary }}>
          Centre de notifications
        </div>
        <Badge variant="gray" size="sm">
          {visibleNotifications.length}
        </Badge>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: designSystem.spacing.md,
          marginTop: designSystem.spacing.md,
        }}
      >
        {visibleNotifications.length === 0 ? (
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Tout est à jour. Aucune notification importante.
          </div>
        ) : (
          visibleNotifications.map((item) => (
            <div
              key={item.id}
              style={{
                border: `1px solid ${designSystem.colors.gray[200]}`,
                borderRadius: designSystem.borderRadius.md,
                padding: designSystem.spacing.md,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: designSystem.spacing.md,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: designSystem.spacing.sm }}>
                  <Badge variant={getBadgeVariant(item.severity)} size="sm">
                    {item.severity.toUpperCase()}
                  </Badge>
                  <span style={{ ...designSystem.typography.body, color: designSystem.colors.text.primary }}>
                    {item.title}
                  </span>
                </div>
                <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                  {item.description}
                </div>
              </div>
              <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
                {item.actionLabel && (
                  <Button variant="primary" size="sm" onClick={item.onAction}>
                    {item.actionLabel}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveDismissed({ ...dismissed, [item.id]: true })}
                >
                  Fermer
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
