"use client";

import { useState } from "react";
import { designSystem } from "@/src/lib/design-system";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import FichePresenceNewContent from "@/Components/FichePresenceNewContent";

export function AttendanceManager() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.lg }}>
      <div>
        <div
          style={{
            ...designSystem.typography.h2,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing.xs,
          }}
        >
          Présences
        </div>
        <div style={{ ...designSystem.typography.body, color: designSystem.colors.text.secondary }}>
          Créez et exportez des fiches de présence liées aux cours.
        </div>
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: designSystem.spacing.md,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                ...designSystem.typography.h4,
                color: designSystem.colors.text.primary,
                marginBottom: designSystem.spacing.xs,
              }}
            >
              Nouvelle fiche de présence
            </div>
            <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
              Sélectionnez un cours et générez un fichier XLSX prêt à l’export.
            </div>
          </div>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Créer une fiche
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Créer une fiche de présence"
        size="lg"
      >
        <FichePresenceNewContent close={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
