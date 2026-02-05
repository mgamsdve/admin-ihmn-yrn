"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { designSystem } from "@/src/lib/design-system";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { Spinner } from "@/src/components/ui/Spinner";
import { Table } from "@/src/components/ui/Table";
import { useToast } from "@/src/hooks/useToast";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { ExportManager } from "@/src/components/features/ExportManager";
import { ImportManager } from "@/src/components/features/ImportManager";
import { AssignCourseModal } from "@/src/components/features/AssignCourseModal";
import { ActionTemplates } from "@/src/components/features/ActionTemplates";
import {
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
} from "@/src/lib/constants";
import { addCoursToTheUser } from "@/firebaseFun";

interface StudentListProps {
  onAddNew?: () => void;
  onEdit?: (id: string) => void;
}

export function StudentList({ onAddNew, onEdit }: StudentListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { spacing, typography, colors } = designSystem;
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    year: "",
  });
  const [quickFilter, setQuickFilter] = useState<
    "all" | "missingEmail" | "missingPhone" | "missingYear" | "archived"
  >("all");
  const [autoViewApplied, setAutoViewApplied] = useState(false);
  const [tableDensity, setTableDensity] = useState<"compact" | "comfortable">(
    "comfortable",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("ihmn_students_view_autoload");
    if (!saved) return;
    const payload = JSON.parse(saved);
    setQuickFilter(payload.quickFilter || "all");
    if (payload.searchTerm !== undefined) {
      setSearchTerm(payload.searchTerm || "");
    }
    if (payload.filters) {
      setFilters(payload.filters);
    }
    window.localStorage.removeItem("ihmn_students_view_autoload");
    setAutoViewApplied(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoViewApplied) return;
    const stored = window.localStorage.getItem("ihmn_settings");
    if (!stored) return;
    const settings = JSON.parse(stored);
    if (settings.defaultStudentQuickFilter) {
      setQuickFilter(settings.defaultStudentQuickFilter);
    }
    if (settings.compactTables) {
      setTableDensity("compact");
    }
  }, [autoViewApplied]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const { addToast } = useToast();

  // Fetch students
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter(
          (doc: any) =>
            doc.role === "student" || (!doc.role && doc.prename && doc.name),
        );
      setStudents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Search filter
  const normalizedStudents = useMemo(() => {
    return students.map((student) => ({
      ...student,
      normalizedYear: student.année ?? student.annee ?? "",
      normalizedStatus: student.status || "active",
    }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return normalizedStudents.filter((student) => {
      const matchesSearch =
        student.prename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status
        ? student.normalizedStatus === filters.status
        : true;

      const matchesYear = filters.year
        ? String(student.normalizedYear) === String(filters.year)
        : true;

      const matchesQuick = (() => {
        switch (quickFilter) {
          case "missingEmail":
            return !student.email;
          case "missingPhone":
            return !student.phone;
          case "missingYear":
            return !student.normalizedYear;
          case "archived":
            return student.normalizedStatus === "archived";
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesYear && matchesQuick;
    });
  }, [normalizedStudents, searchTerm, filters, quickFilter]);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        normalizedStudents
          .map((s) => s.normalizedYear)
          .filter(
            (value) => value !== "" && value !== null && value !== undefined,
          ),
      ),
    )
      .map((year) => String(year))
      .sort();

    return years.map((year) => ({ value: year, label: `Année ${year}` }));
  }, [normalizedStudents]);

  const filterConfig = [
    {
      key: "status",
      label: "Statut",
      type: "select" as const,
      options: Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "year",
      label: "Année",
      type: "select" as const,
      options: yearOptions,
    },
  ];

  const quickStats = useMemo(() => {
    const active = normalizedStudents.filter(
      (s) => s.normalizedStatus === "active",
    ).length;
    const archived = normalizedStudents.filter(
      (s) => s.normalizedStatus === "archived",
    ).length;
    const missingEmail = normalizedStudents.filter((s) => !s.email).length;
    const missingPhone = normalizedStudents.filter((s) => !s.phone).length;
    const missingYear = normalizedStudents.filter(
      (s) => !s.normalizedYear,
    ).length;
    return { active, archived, missingEmail, missingPhone, missingYear };
  }, [normalizedStudents]);

  const saveView = () => {
    if (typeof window === "undefined") return;
    const payload = { searchTerm, filters, quickFilter };
    window.localStorage.setItem("ihmn_students_view", JSON.stringify(payload));
    addToast?.("Vue enregistrée", "success");
  };

  const loadView = () => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("ihmn_students_view");
    if (!saved) {
      addToast?.("Aucune vue enregistrée", "warning");
      return;
    }
    const payload = JSON.parse(saved);
    setSearchTerm(payload.searchTerm || "");
    setFilters(payload.filters || { status: "", year: "" });
    setQuickFilter(payload.quickFilter || "all");
    addToast?.("Vue chargée", "success");
  };

  const recentStudents = useMemo(() => {
    const toDate = (value: any) => {
      if (!value) return 0;
      if (typeof value.toDate === "function") return value.toDate().getTime();
      if (value instanceof Date) return value.getTime();
      return new Date(value).getTime();
    };
    return [...normalizedStudents]
      .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
      .slice(0, 5);
  }, [normalizedStudents]);

  const templates = [
    {
      id: "students-missing-email",
      title: "Nettoyer emails",
      description: "Afficher les étudiants sans email.",
      apply: () => setQuickFilter("missingEmail"),
    },
    {
      id: "students-missing-year",
      title: "Compléter années",
      description: "Afficher les étudiants sans année.",
      apply: () => setQuickFilter("missingYear"),
    },
    {
      id: "students-archived",
      title: "Vue archivés",
      description: "Afficher uniquement les étudiants archivés.",
      apply: () => setQuickFilter("archived"),
    },
  ];

  const handleDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, "users", id));
      }
      addToast?.(`${selectedIds.length} étudiant(s) supprimé(s)`, "success");
      setSelectedIds([]);
      setDeleteConfirmOpen(false);
    } catch (err) {
      addToast?.("Erreur lors de la suppression", "error");
    }
  };

  const handleBulkStatus = async (status: string) => {
    try {
      for (const id of selectedIds) {
        await updateDoc(doc(db, "users", id), { status });
      }
      addToast?.(
        `${selectedIds.length} étudiant(s) mis à jour (${status})`,
        "success",
      );
      setSelectedIds([]);
    } catch (err) {
      addToast?.("Erreur lors de la mise à jour", "error");
    }
  };

  const handleCopyEmails = async () => {
    const emails = filteredStudents
      .filter((student) => selectedIds.includes(student.id))
      .map((student) => student.email)
      .filter(Boolean)
      .join(", ");
    if (!emails) {
      addToast?.("Aucun email disponible", "warning");
      return;
    }
    await navigator.clipboard.writeText(emails);
    addToast?.("Emails copiés dans le presse‑papiers", "success");
  };

  const handleCopyPhones = async () => {
    const phones = filteredStudents
      .filter((student) => selectedIds.includes(student.id))
      .map((student) => student.phone)
      .filter(Boolean)
      .join(", ");
    if (!phones) {
      addToast?.("Aucun téléphone disponible", "warning");
      return;
    }
    await navigator.clipboard.writeText(phones);
    addToast?.("Téléphones copiés dans le presse‑papiers", "success");
  };

  const handleAssignToCourse = async (selection: {
    periodId: string;
    yearId: string;
    courseId: string;
  }) => {
    try {
      for (const id of selectedIds) {
        await addCoursToTheUser(
          id,
          selection.yearId,
          selection.periodId,
          selection.courseId,
        );
      }
      addToast?.(
        `${selectedIds.length} étudiant(s) assigné(s) au cours`,
        "success",
      );
      setSelectedIds([]);
    } catch (err) {
      addToast?.("Erreur lors de l'assignation", "error");
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
            Étudiants
          </div>
          <div style={{ ...typography.body, color: colors.text.secondary }}>
            Gérez vos {students.length} étudiants
          </div>
        </div>
        <Button variant="primary" onClick={onAddNew}>
          ➕ Ajouter étudiant
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
              onClick={() => handleBulkStatus("archived")}
            >
              Archiver
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
        data={filteredStudents}
        fileName="students"
        columns={[
          "prename",
          "name",
          "email",
          "phone",
          "normalizedYear",
          "normalizedStatus",
        ]}
      />

      <ActionTemplates templates={templates} />

      <ImportManager
        title="Importer des étudiants"
        collectionName="users"
        fields={[
          { key: "prename", label: "Nom", required: true },
          { key: "name", label: "Prénom", required: true },
          { key: "email", label: "Email", required: true, type: "email" },
          { key: "phone", label: "Téléphone", type: "string" },
          { key: "dateDeNaissance", label: "Date de naissance", type: "date" },
          { key: "annee", label: "Année", type: "number" },
          { key: "adresse", label: "Adresse", type: "string" },
          { key: "status", label: "Statut" },
        ]}
        defaultValues={{ role: "student" }}
        transform={(row) => ({
          ...row,
          dateNaissance: row.dateDeNaissance,
          année:
            row.annee !== undefined && row.annee !== ""
              ? Number(row.annee)
              : row.année,
        })}
      />

      <AssignCourseModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        onConfirm={handleAssignToCourse}
        title="Assigner les étudiants à un cours"
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
        {recentStudents.length === 0 ? (
          <div
            style={{ ...typography.bodySmall, color: colors.text.secondary }}
          >
            Aucun étudiant récent
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing[2],
            }}
          >
            {recentStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => router.push(`/students/${student.id}`)}
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
                  {student.prename} {student.name}
                </span>
                <Badge variant="gray">{student.email || "Sans email"}</Badge>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div
          style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}
        >
          <FilterBar
            filters={filters}
            onFilterChange={(key, value) =>
              setFilters({ ...filters, [key]: value })
            }
            onClear={() => setFilters({ status: "", year: "" })}
            filterConfig={filterConfig}
          />

          <div style={{ display: "flex", gap: spacing[2], flexWrap: "wrap" }}>
            <Button
              variant={quickFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("all")}
            >
              Tous ({normalizedStudents.length})
            </Button>
            <Button
              variant={quickFilter === "archived" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("archived")}
            >
              Archivés ({quickStats.archived})
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
              variant={quickFilter === "missingYear" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setQuickFilter("missingYear")}
            >
              Sans année ({quickStats.missingYear})
            </Button>
            <div
              style={{ marginLeft: "auto", display: "flex", gap: spacing[2] }}
            >
              <Button variant="ghost" size="sm" onClick={saveView}>
                Enregistrer la vue
              </Button>
              <Button variant="ghost" size="sm" onClick={loadView}>
                Charger la vue
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: spacing[8],
            }}
          >
            <Spinner />
          </div>
        ) : (
          <Table
            columns={[
              {
                key: "profilePic",
                label: "Photo",
                hideable: true,
                render: (value) => (
                  <img
                    src={value || "https://via.placeholder.com/40"}
                    alt="Profile"
                    width={50}
                    style={{ borderRadius: "50%", maxHeight: "50px" }}
                  />
                ),
              },
              { key: "prename", label: "Nom", width: "150px", minWidth: 120 },
              { key: "name", label: "Prénom", width: "150px", minWidth: 120 },
              {
                key: "dateDeNaissance",
                label: "Date de naissance",
                width: "130px",
                hideable: true,
              },
              {
                key: "normalizedYear",
                label: "Année",
                width: "100px",
                render: (value) => (
                  <Badge variant="primary">{value || "-"}</Badge>
                ),
              },
              {
                key: "normalizedStatus",
                label: "Statut",
                width: "120px",
                render: (value) => (
                  <Badge
                    variant={
                      (STUDENT_STATUS_COLORS[value] || "gray") as
                        | "primary"
                        | "success"
                        | "danger"
                        | "warning"
                        | "gray"
                    }
                  >
                    {STUDENT_STATUS_LABELS[value] || value || "-"}
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
            data={filteredStudents}
            selectable
            onSelectionChange={setSelectedIds}
            configKey="students"
            showPreferences
            density={tableDensity}
            onRowClick={(student) => {
              if (onEdit) {
                onEdit(student.id);
              } else {
                router.push(`/students/${student.id}`);
              }
            }}
            emptyState={
              <div style={{ textAlign: "center", padding: spacing[8] }}>
                <div style={{ fontSize: "48px", marginBottom: spacing[2] }}>
                  👥
                </div>
                <div
                  style={{ ...typography.body, color: colors.text.secondary }}
                >
                  Aucun étudiant trouvé
                </div>
              </div>
            }
          />
        )}
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
          Êtes-vous sûr de vouloir supprimer {selectedIds.length} étudiant(s) ?
          Cette action est irréversible.
        </div>
      </Modal>
    </div>
  );
}
