"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useProfessor } from "@/src/hooks/useProfessor";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/src/hooks/useToast";
import { useConfirm } from "@/src/hooks/useConfirm";
import { professorService } from "@/src/lib/services/professorService";
import { designSystem } from "@/src/lib/design-system";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { Tabs } from "@/src/components/ui/Tabs";
import { Select } from "@/src/components/ui/Select";
import { Badge } from "@/src/components/ui/Badge";
import { TreeView } from "@/src/components/ui/TreeView";
import { PROFESSOR_STATUS_LABELS, MESSAGES } from "@/src/lib/constants";
import { Spinner } from "@/src/components/ui/Spinner";
import {
  collection,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";

interface ProfessorDetailProps {
  professorId: string;
}

export function ProfessorDetail({ professorId }: ProfessorDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { professor, loading, error, update } = useProfessor(professorId);
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseTree, setCourseTree] = useState<
    Array<{
      period: string;
      years: Array<{
        year: string;
        courses: Array<{
          id: string;
          name: string;
        }>;
      }>;
    }>
  >([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    prename: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    status: "active" | "inactive" | "on_leave";
    bio: string;
  }>({
    prename: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
    status: "active",
    bio: "",
  });

  // Initialize form data when professor loads
  React.useEffect(() => {
    if (professor) {
      setFormData({
        prename: professor.prename || "",
        name: professor.name || "",
        email: professor.email || "",
        phone: professor.phone || "",
        specialization: professor.specialization || "",
        status: (professor.status || "active") as
          | "active"
          | "inactive"
          | "on_leave",
        bio: professor.bio || "",
      });
    }
  }, [professor]);

  // Load professor courses (from profs/{id}/periods subcollection)
  React.useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const periodsSnap = await getDocs(
          collection(db, "profs", professorId, "periods"),
        );

        const periodGroups: Array<{
          period: string;
          years: Array<{
            year: string;
            courses: Array<{ id: string; name: string }>;
          }>;
        }> = [];

        for (const periodDoc of periodsSnap.docs) {
          const periodId = periodDoc.id;
          const anneesSnap = await getDocs(
            collection(db, "profs", professorId, "periods", periodId, "annees"),
          );

          const years = await Promise.all(
            anneesSnap.docs.map(async (anneeDoc) => {
              const anneeId = anneeDoc.id;
              const coursSnap = await getDocs(
                collection(
                  db,
                  "profs",
                  professorId,
                  "periods",
                  periodId,
                  "annees",
                  anneeId,
                  "cours",
                ),
              );

              const courses = await Promise.all(
                coursSnap.docs.map(async (coursDoc) => {
                  const courseRef = coursDoc.data().cour;
                  let courseName = coursDoc.id;
                  if (courseRef) {
                    const courseSnap = await getDoc(courseRef);
                    if (courseSnap.exists()) {
                      const courseData: any = courseSnap.data();
                      courseName = courseData.nomDuCour || courseSnap.id;
                    }
                  }
                  return {
                    id: coursDoc.id,
                    name: courseName,
                  };
                }),
              );

              return {
                year: anneeId,
                courses,
              };
            }),
          );

          periodGroups.push({
            period: periodId,
            years,
          });
        }

        if (active) {
          setCourseTree(periodGroups);
          setCoursesLoading(false);
        }
      } catch (err) {
        if (active) {
          setCourseTree([]);
          setCoursesLoading(false);
        }
      }
    };

    if (professorId) {
      loadCourses();
    }

    return () => {
      active = false;
    };
  }, [professorId]);

  // Load professor history (audit logs)
  React.useEffect(() => {
    if (!professorId) return;
    const q = query(
      collection(db, "auditLogs"),
      where("entityType", "==", "professor"),
      where("entityId", "==", professorId),
      orderBy("timestamp", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistoryLogs(logs);
    });
    return () => unsubscribe();
  }, [professorId]);

  const courseCount = useMemo(() => {
    return courseTree.reduce(
      (acc, period) =>
        acc + period.years.reduce((sum, year) => sum + year.courses.length, 0),
      0,
    );
  }, [courseTree]);

  const completeness = useMemo(() => {
    if (!professor) return 0;
    const fields = [
      professor.prename,
      professor.name,
      professor.email,
      professor.phone,
      professor.specialization,
      professor.status,
      professor.bio,
    ];
    const filled = fields.filter(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    ).length;
    return Math.round((filled / fields.length) * 100);
  }, [professor]);

  const formatTimestamp = (value: any) => {
    if (!value) return "-";
    if (typeof value.toDate === "function") {
      return value.toDate().toLocaleString("fr-FR");
    }
    if (value instanceof Date) {
      return value.toLocaleString("fr-FR");
    }
    return new Date(value).toLocaleString("fr-FR");
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await update(formData, user.uid);
      addToast?.(MESSAGES.SUCCESS_UPDATE("Professor"), "success");
      setIsEditing(false);
    } catch (err: any) {
      addToast?.(MESSAGES.ERROR_SAVE, "error");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmed = await confirm(
      "Delete Professor",
      MESSAGES.CONFIRM_DELETE_PROFESSOR(professor?.name || ""),
      async () => {
        await professorService.deleteProfessor(professorId, user.uid);
        addToast?.(MESSAGES.SUCCESS_DELETE("Professor"), "success");
        router.push("/professors");
      },
      { dangerous: true },
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (error || !professor) {
    return (
      <Card>
        <div
          style={{
            padding: designSystem.spacing.lg,
            color: designSystem.colors.danger[600],
          }}
        >
          Error loading professor
        </div>
      </Card>
    );
  }

  const courseTabs = [
    {
      id: "info",
      label: "Profil",
      content: (
        <div
          style={{
            display: "grid",
            gap: designSystem.spacing.md,
            maxWidth: "600px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: designSystem.spacing.md,
            }}
          >
            <Input
              label="Prénom"
              value={formData.prename}
              onChange={(e) =>
                setFormData({ ...formData, prename: e.target.value })
              }
              disabled={!isEditing}
            />
            <Input
              label="Nom"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={!isEditing}
          />

          <Input
            label="Téléphone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            disabled={!isEditing}
          />

          <Input
            label="Spécialité"
            value={formData.specialization}
            onChange={(e) =>
              setFormData({ ...formData, specialization: e.target.value })
            }
            disabled={!isEditing}
          />

          <Select
            label="Statut"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e as any })}
            options={Object.entries(PROFESSOR_STATUS_LABELS).map(
              ([value, label]) => ({
                value,
                label,
              }),
            )}
            disabled={!isEditing}
          />

          <Input
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            multiline
            rows={4}
          />
        </div>
      ),
    },
    {
      id: "courses",
      label: "Cours",
      badge: courseCount ? courseCount : undefined,
      content: (
        <div>
          {coursesLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: designSystem.spacing.lg,
              }}
            >
              <Spinner />
            </div>
          ) : courseTree.length === 0 ? (
            <div
              style={{
                ...designSystem.typography.body,
                color: designSystem.colors.gray[600],
                textAlign: "center",
                padding: designSystem.spacing.lg,
              }}
            >
              Aucun cours associé
            </div>
          ) : (
            <TreeView
              nodes={courseTree.map((period) => ({
                id: `period-${period.period}`,
                label: period.period,
                metadata: { type: "period" },
                children: period.years.map((year) => ({
                  id: `period-${period.period}-year-${year.year}`,
                  label: year.year,
                  metadata: { type: "year" },
                  children: year.courses.map((course) => ({
                    id: `course-${course.id}`,
                    label: course.name,
                    metadata: { type: "course" },
                  })),
                })),
              }))}
              storageKey={`ihmn_professor_courses_${professorId}`}
            />
          )}
        </div>
      ),
    },
    {
      id: "history",
      label: "Historique",
      content: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: designSystem.spacing.sm,
          }}
        >
          {historyLogs.length === 0 ? (
            <div
              style={{
                ...designSystem.typography.body,
                color: designSystem.colors.gray[600],
                textAlign: "center",
                padding: designSystem.spacing.lg,
              }}
            >
              Aucun historique disponible
            </div>
          ) : (
            historyLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: designSystem.spacing.md,
                  border: `1px solid ${designSystem.colors.gray[200]}`,
                  borderRadius: designSystem.borderRadius.md,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: designSystem.spacing.xs,
                  }}
                >
                  <span style={{ ...designSystem.typography.body }}>
                    {log.action?.toUpperCase() || "ACTION"} • {log.entityType}
                  </span>
                  <span
                    style={{
                      ...designSystem.typography.bodySmall,
                      color: designSystem.colors.gray[600],
                    }}
                  >
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <Badge variant="gray">{log.userId || "System"}</Badge>
              </div>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: designSystem.spacing.lg,
          gap: designSystem.spacing.md,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: designSystem.spacing.md,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <div>
            <h1
              style={{
                ...designSystem.typography.h2,
                margin: "0",
                color: designSystem.colors.gray[900],
              }}
            >
              {professor.prename} {professor.name}
            </h1>
            <p
              style={{
                ...designSystem.typography.caption,
                color: designSystem.colors.gray[600],
                margin: "0",
              }}
            >
              {PROFESSOR_STATUS_LABELS[professor.status] || "Inconnu"} •{" "}
              {professor.specialization || "Sans spécialité"}
            </p>
          </div>
          <Badge
            variant={
              completeness >= 80
                ? "success"
                : completeness >= 50
                  ? "warning"
                  : "danger"
            }
          >
            Complétude {completeness}%
          </Badge>
        </div>

        <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs items={courseTabs} />
      </Card>
    </div>
  );
}
