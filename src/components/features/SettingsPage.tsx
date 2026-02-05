"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { designSystem } from "@/src/lib/design-system";

interface SettingsState {
  showOnboarding: boolean;
  defaultStudentQuickFilter: string;
  defaultProfessorQuickFilter: string;
  compactTables: boolean;
  cardSize: "compact" | "default" | "large";
}

const defaultState: SettingsState = {
  showOnboarding: true,
  defaultStudentQuickFilter: "all",
  defaultProfessorQuickFilter: "all",
  compactTables: false,
  cardSize: "default",
};

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultState);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ihmn_settings");
    if (stored) {
      const merged = { ...defaultState, ...JSON.parse(stored) };
      setSettings(merged);
      applyUIPreferences(merged);
    }
  }, []);

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      applyUIPreferences(next);
      return next;
    });
    setSaved(false);
  };

  const applyUIPreferences = (next: SettingsState) => {
    if (typeof window === "undefined") return;
    const cardPadding =
      next.cardSize === "compact"
        ? "1rem"
        : next.cardSize === "large"
          ? "2rem"
          : "1.5rem";
    document.documentElement.style.setProperty("--ihmn-card-padding", cardPadding);
  };

  const handleSave = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ihmn_settings", JSON.stringify(settings));
    setSaved(true);
  };

  const quickFilterOptions = [
    { value: "all", label: "Tous" },
    { value: "missingEmail", label: "Sans email" },
    { value: "missingPhone", label: "Sans téléphone" },
    { value: "missingYear", label: "Sans année" },
    { value: "archived", label: "Archivés" },
  ];

  const professorQuickFilterOptions = [
    { value: "all", label: "Tous" },
    { value: "missingEmail", label: "Sans email" },
    { value: "missingPhone", label: "Sans téléphone" },
    { value: "missingSpec", label: "Sans spécialité" },
    { value: "onLeave", label: "En congé" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.lg }}>
      <div>
        <div style={{ ...designSystem.typography.h2, color: designSystem.colors.text.primary }}>
          Paramètres
        </div>
        <div style={{ ...designSystem.typography.body, color: designSystem.colors.text.secondary }}>
          Personnalisez l'expérience admin, les vues et les préférences de navigation.
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
          <div style={{ ...designSystem.typography.h4 }}>Général</div>
          <Checkbox
            checked={settings.showOnboarding}
            onChange={(value) => updateSettings({ showOnboarding: value })}
            label="Afficher le démarrage guidé sur le dashboard"
          />
          <Checkbox
            checked={settings.compactTables}
            onChange={(value) => updateSettings({ compactTables: value })}
            label="Mode compact pour les tableaux"
          />
          <div>
            <label
              style={{
                ...designSystem.typography.bodySmall,
                color: designSystem.colors.text.secondary,
                display: "block",
                marginBottom: designSystem.spacing.xs,
              }}
            >
              Taille des cartes
            </label>
            <select
              value={settings.cardSize}
              onChange={(e) => updateSettings({ cardSize: e.target.value as SettingsState["cardSize"] })}
              style={{
                width: "100%",
                padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                borderRadius: designSystem.borderRadius.md,
                border: `1px solid ${designSystem.colors.gray[300]}`,
              }}
            >
              <option value="compact">Compact</option>
              <option value="default">Standard</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
          <div style={{ ...designSystem.typography.h4 }}>Vues par défaut</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: designSystem.spacing.md }}>
            <div>
              <label
                style={{
                  ...designSystem.typography.bodySmall,
                  color: designSystem.colors.text.secondary,
                  display: "block",
                  marginBottom: designSystem.spacing.xs,
                }}
              >
                Filtre étudiants
              </label>
              <select
                value={settings.defaultStudentQuickFilter}
                onChange={(e) => updateSettings({ defaultStudentQuickFilter: e.target.value })}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                }}
              >
                {quickFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  ...designSystem.typography.bodySmall,
                  color: designSystem.colors.text.secondary,
                  display: "block",
                  marginBottom: designSystem.spacing.xs,
                }}
              >
                Filtre professeurs
              </label>
              <select
                value={settings.defaultProfessorQuickFilter}
                onChange={(e) => updateSettings({ defaultProfessorQuickFilter: e.target.value })}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                }}
              >
                {professorQuickFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: designSystem.spacing.sm, alignItems: "center" }}>
        <Button variant="primary" onClick={handleSave}>
          Enregistrer les paramètres
        </Button>
        {saved && (
          <span style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.success[600] }}>
            Paramètres enregistrés
          </span>
        )}
      </div>
    </div>
  );
}
