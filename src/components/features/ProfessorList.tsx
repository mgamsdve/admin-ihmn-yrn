"use client";

import React, { useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Table } from "@/src/components/ui/Table";
import { Modal } from "@/src/components/ui/Modal";
import { useToast } from "@/src/hooks/useToast";
import { colors, spacing, typography, designSystem } from "@/src/lib/design-system";
import Image from "next/image";
import { useRouter } from "next/router";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { ExportManager } from "@/src/components/features/ExportManager";
import { ImportManager } from "@/src/components/features/ImportManager";
import { PROFESSOR_STATUS_LABELS, PROFESSOR_STATUS_COLORS } from "@/src/lib/constants";
import { AssignCourseModal } from "@/src/components/features/AssignCourseModal";
import { addCourseToTheProffesor } from "@/firebaseFun";
import { ActionTemplates } from "@/src/components/features/ActionTemplates";

interface ProfessorListProps {
  onAddNew?: () => void;
  onEdit?: (id: string) => void;
}

export const ProfessorList: React.FC<ProfessorListProps> = ({
  onAddNew,
  onEdit,
}) => {
  const [professors, setProfessors] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({
    status: "",
    specialization: "",
  });
  const [quickFilter, setQuickFilter] = React.useState<
    "all" | "missingEmail" | "missingPhone" | "missingSpec" | "onLeave"
  >("all");
  const [autoViewApplied, setAutoViewApplied] = React.useState(false);
  const [tableDensity, setTableDensity] =
    React.useState<"compact" | "comfortable">("comfortable");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("ihmn_professors_view_autoload");
    if (!saved) return;
    const payload = JSON.parse(saved);
    setQuickFilter(payload.quickFilter || "all");
    if (payload.searchTerm !== undefined) {
      setSearchTerm(payload.searchTerm || "");
    }
    if (payload.filters) {
      setFilters(payload.filters);
    }
    window.localStorage.removeItem("ihmn_professors_view_autoload");
    setAutoViewApplied(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoViewApplied) return;
    const stored = window.localStorage.getItem("ihmn_settings");
    if (!stored) return;
    const settings = JSON.parse(stored);
    if (settings.defaultProfessorQuickFilter) {
      setQuickFilter(settings.defaultProfessorQuickFilter);
    }
    if (settings.compactTables) {
      setTableDensity("compact");
    }
  }, [autoViewApplied]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  // Fetch professors
  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "profs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setProfessors(data);
    });
    return () => unsubscribe();
  }, []);

  // Search filter
  const normalizedProfessors = useMemo(() => {
    return professors.map((prof) => ({
      ...prof,
      normalizedStatus: prof.status || "active",
      normalizedSpecialization: prof.specialization || prof.specialite || "",
    }));
  }, [professors]);

  const filteredProfessors = useMemo(() => {
    return normalizedProfessors.filter((prof) => {
      const matchesSearch =
        prof.prename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status
        ? prof.normalizedStatus === filters.status
        : true;

      const matchesSpec = filters.specialization
        ? prof.normalizedSpecialization === filters.specialization
        : true;

      const matchesQuick = (() => {
        switch (quickFilter) {
          case "missingEmail":
            return !prof.email;
          case "missingPhone":
            return !prof.phone;
          case "missingSpec":
            return !prof.normalizedSpecialization;
          case "onLeave":
            return prof.normalizedStatus === "on_leave";
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesSpec && matchesQuick;
    });
  }, [normalizedProfessors, searchTerm, filters, quickFilter]);

  const specializationOptions = useMemo(() => {
    const specs = Array.from(
      new Set(
        normalizedProfessors
          .map((p) => p.normalizedSpecialization)
          .filter((value) => value !== "" && value !== null && value !== undefined),
      ),
    ).sort();

    return specs.map((spec) => ({ value: spec, label: spec }));
  }, [normalizedProfessors]);

  const filterConfig = [
    {
      key: "status",
      label: "Statut",
      type: "select" as const,
      options: Object.entries(PROFESSOR_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "specialization",
      label: "Spécialité",
      type: "select" as const,
      options: specializationOptions,
    },
  ];

  const quickStats = useMemo(() => {
    const onLeave = normalizedProfessors.filter(
      (p) => p.normalizedStatus === "on_leave",
    ).length;
    const missingEmail = normalizedProfessors.filter((p) => !p.email).length;
    const missingPhone = normalizedProfessors.filter((p) => !p.phone).length;
    const missingSpec = normalizedProfessors.filter(
      (p) => !p.normalizedSpecialization,
    ).length;
    return { onLeave, missingEmail, missingPhone, missingSpec };
  }, [normalizedProfessors]);

  const templates = [
    {
      id: "professors-missing-spec",
      title: "Compléter spécialités",
      description: "Afficher les professeurs sans spécialité.",
      apply: () => setQuickFilter("missingSpec"),
    },
    {
      id: "professors-on-leave",
      title: "Vue en congé",
      description: "Afficher les professeurs en congé.",
      apply: () => setQuickFilter("onLeave"),
    },
    {
      id: "professors-missing-email",
      title: "Nettoyer emails",
      description: "Afficher les professeurs sans email.",
      apply: () => setQuickFilter("missingEmail"),
    },
  ];

  const saveView = () => {
    if (typeof window === "undefined") return;
    const payload = { searchTerm, filters, quickFilter };
    window.localStorage.setItem("ihmn_professors_view", JSON.stringify(payload));
    success("Vue enregistrée");
  };

  const loadView = () => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("ihmn_professors_view");
    if (!saved) {
      error("Aucune vue enregistrée");
      return;
    }
    const payload = JSON.parse(saved);
    setSearchTerm(payload.searchTerm || "");
    setFilters(payload.filters || { status: "", specialization: "" });
    setQuickFilter(payload.quickFilter || "all");
    success("Vue chargée");
  };

  const recentProfessors = useMemo(() => {
    const toDate = (value: any) => {
      if (!value) return 0;
      if (typeof value.toDate === "function") return value.toDate().getTime();
      if (value instanceof Date) return value.getTime();
      return new Date(value).getTime();
    };
    return [...normalizedProfessors]
      .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
      .slice(0, 5);
  }, [normalizedProfessors]);

  const handleDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, "profs", id));
      }
      success(`${selectedIds.length} professeur(s) supprimé(s)`);
      setSelectedIds([]);
      setDeleteConfirmOpen(false);
    } catch (err) {
      error("Erreur lors de la suppression");
    }
  };

  const handleBulkStatus = async (status: string) => {
    try {
      for (const id of selectedIds) {
        await updateDoc(doc(db, "profs", id), { status });
      }
      success(`${selectedIds.length} professeur(s) mis à jour (${status})`);
      setSelectedIds([]);
    } catch (err) {
      error("Erreur lors de la mise à jour");
    }
  };

  const handleCopyEmails = async () => {
    const emails = filteredProfessors
      .filter((prof) => selectedIds.includes(prof.id))
      .map((prof) => prof.email)
      .filter(Boolean)
      .join(", ");
    if (!emails) {
      error("Aucun email disponible");
      return;
    }
    await navigator.clipboard.writeText(emails);
    success("Emails copiés dans le presse‑papiers");
  };

  const handleCopyPhones = async () => {
    const phones = filteredProfessors
      .filter((prof) => selectedIds.includes(prof.id))
      .map((prof) => prof.phone)
      .filter(Boolean)
      .join(", ");
    if (!phones) {
      error("Aucun téléphone disponible");
      return;
    }
    await navigator.clipboard.writeText(phones);
    success("Téléphones copiés dans le presse‑papiers");
  };

  const handleAssignToCourse = async (selection: {
    periodId: string;
    yearId: string;
    courseId: string;
  }) => {
    try {
      for (const id of selectedIds) {
        await addCourseToTheProffesor(
          id,
          selection.yearId,
          selection.periodId,
          selection.courseId,
        );
      }
      success(`${selectedIds.length} professeur(s) assigné(s) au cours`);
      setSelectedIds([]);
    } catch (err) {
      error("Erreur lors de l'assignation");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            Professeurs
          </div>
          <div style={{ ...typography.body, color: colors.text.secondary }}>
            Gérez vos {professors.length} professeurs
          </div>
        </div>
        <Button variant="primary" onClick={onAddNew}>
          ➕ Ajouter professeur
        </Button>
      </div>

      {/* Toolbar */}
      <Card style={{ display: "flex", gap: spacing[3], alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <SearchInput
            onSearch={setSearchTerm}
            placeholder="Nom, prénom ou email..."
          />
        </div>
        {selectedIds.length > 0 && (
          <div
            style={{ display: "flex", gap: spacing[2], alignItems: "center" }}
          >
            <Badge variant="primary">{selectedIds.length} sélectionné(s)</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkStatus("active")}
            >
              Activer
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkStatus("on_leave")}
            >
              Mettre en congé
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyEmails}>
              Copier emails
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyPhones}>
              Copier téléphones
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAssignOpen(true)}
            >
              Assigner à un cours
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              ⚠ Supprimer
            </Button>
          </div>
        )}
      </Card>

      <ExportManager
        data={filteredProfessors}
        fileName="professors"
        columns={[
          "prename",
          "name",
          "email",
          "phone",
          "normalizedSpecialization",
          "normalizedStatus",
        ]}
      />

      <ActionTemplates templates={templates} />

      <ImportManager
        title="Importer des professeurs"
        collectionName="profs"
        fields={[
          { key: "prename", label: "Nom", required: true },
          { key: "name", label: "Prénom", required: true },
          { key: "email", label: "Email", required: true, type: "email" },
          { key: "phone", label: "Téléphone", type: "string" },
          { key: "specialite", label: "Spécialité", type: "string" },
          { key: "status", label: "Statut" },
          { key: "adresse", label: "Adresse", type: "string" },
        ]}
        transform={(row) => ({
          ...row,
          specialization: row.specialite,
        })}
      />

      <AssignCourseModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        onConfirm={handleAssignToCourse}
        title="Assigner les professeurs à un cours"
      />

      <Card>
        <div
          style={{
            ...typography.h3,
            color: colors.text.primary,
            marginBottom: spacing[3],
          }}
        >
          Récemment ajoutés
        </div>
        {recentProfessors.length === 0 ? (
          <div style={{ ...typography.bodySmall, color: colors.text.secondary }}>
            Aucun professeur récent
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
            {recentProfessors.map((prof) => (
              <button
                key={prof.id}
                type="button"
                onClick={() => router.push(`/professors/${prof.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: spacing[3],
                  border: `1px solid ${colors.border}`,
                  borderRadius: designSystem.borderRadius.md,
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <span style={{ ...typography.body }}>
                  {prof.prename} {prof.name}
                </span>
                <Badge variant="gray">{prof.email || "Sans email"}</Badge>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          <FilterBar
            filters={filters}
            onFilterChange={(key, value) =>
              setFilters({ ...filters, [key]: value })
            }
            onClear={() => setFilters({ status: "", specialization: "" })}
            filterConfig={filterConfig}
          />

          <div style={{ display: "flex", gap: spacing[2], flexWrap: "wrap" }}>
            <Button
              variant={quickFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("all")}
            >
              Tous ({normalizedProfessors.length})
            </Button>
            <Button
              variant={quickFilter === "onLeave" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("onLeave")}
            >
              En congé ({quickStats.onLeave})
            </Button>
            <Button
              variant={quickFilter === "missingEmail" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("missingEmail")}
            >
              Sans email ({quickStats.missingEmail})
            </Button>
            <Button
              variant={quickFilter === "missingPhone" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("missingPhone")}
            >
              Sans téléphone ({quickStats.missingPhone})
            </Button>
            <Button
              variant={quickFilter === "missingSpec" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("missingSpec")}
            >
              Sans spécialité ({quickStats.missingSpec})
            </Button>
            <div style={{ marginLeft: "auto", display: "flex", gap: spacing[2] }}>
              <Button variant="ghost" size="sm" onClick={saveView}>
                Enregistrer la vue
              </Button>
              <Button variant="ghost" size="sm" onClick={loadView}>
                Charger la vue
              </Button>
            </div>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "profilePic",
              label: "Photo",
              width: "60px",
              hideable: true,
              render: (value) => (
                <Image
                  src={value || "https://via.placeholder.com/40"}
                  alt="Profile"
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%" }}
                />
              ),
            },
            { key: "prename", label: "Nom", width: "150px", minWidth: 120 },
            { key: "name", label: "Prénom", width: "150px", minWidth: 120 },
            {
              key: "normalizedSpecialization",
              label: "Spécialité",
              width: "150px",
              hideable: true,
              render: (value) => (
                <Badge variant="success">{value || "-"}</Badge>
              ),
            },
            {
              key: "normalizedStatus",
              label: "Statut",
              width: "120px",
              render: (value) => (
                <Badge variant={(PROFESSOR_STATUS_COLORS[value] || "gray") as "success" | "warning" | "primary" | "danger" | "gray"}>
                  {PROFESSOR_STATUS_LABELS[value] || value || "-"}
                </Badge>
              ),
            },
            {
              key: "email",
              label: "Email",
              render: (value) => (
                <span
                  style={{
                    ...typography.bodySmall,
                    color: colors.text.secondary,
                  }}
                >
                  {value || "-"}
                </span>
              ),
            },
          ]}
          data={filteredProfessors}
          selectable
          onSelectionChange={setSelectedIds}
          configKey="professors"
          showPreferences
          density={tableDensity}
          onRowClick={(prof) => {
            if (onEdit) {
              onEdit(prof.id);
            } else {
              router.push(`/professors/${prof.id}`);
            }
          }}
          emptyState={
            <div style={{ textAlign: "center", padding: spacing[8] }}>
              <div style={{ fontSize: "48px", marginBottom: spacing[2] }}>
                👨‍🏫
              </div>
              <div style={{ ...typography.body, color: colors.text.secondary }}>
                Aucun professeur trouvé
              </div>
            </div>
          }
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirmation de suppression"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <div style={{ ...typography.body, color: colors.text.primary }}>
          Êtes-vous sûr de vouloir supprimer {selectedIds.length} professeur(s)
          ? Cette action est irréversible.
        </div>
      </Modal>
    </div>
  );
};
