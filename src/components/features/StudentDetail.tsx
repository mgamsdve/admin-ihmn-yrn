"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useStudent } from "@/src/hooks/useStudent";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/src/hooks/useToast";
import { useConfirm } from "@/src/hooks/useConfirm";
import { studentService } from "@/src/lib/services/studentService";
import { designSystem } from "@/src/lib/design-system";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { Tabs } from "@/src/components/ui/Tabs";
import { Avatar } from "@/src/components/ui/Avatar";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { Select } from "@/src/components/ui/Select";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import {
  CoursePicker,
  CourseSelection,
} from "@/src/components/features/CoursePicker";
import { addCoursToTheUser } from "@/firebaseFun";
import { TreeView } from "@/src/components/ui/TreeView";
import {
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  STUDENT_STATUSES,
  MESSAGES,
} from "@/src/lib/constants";
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

interface StudentDetailProps {
  studentId: string;
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { student, loading, error, update } = useStudent(studentId);
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
          professor?: string;
        }>;
      }>;
    }>
  >([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [formData, setFormData] = useState<{
    prename: string;
    name: string;
    email: string;
    phone: string;
    dateNaissance: string;
    année: number;
    status: "active" | "inactive" | "graduated" | "archived";
    address: string;
  }>({
    prename: "",
    name: "",
    email: "",
    phone: "",
    dateNaissance: "",
    année: 1,
    status: "active",
    address: "",
  });

  // Initialize form data when student loads
  React.useEffect(() => {
    if (student) {
      setFormData({
        prename: student.prename || "",
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        dateNaissance: student.dateNaissance || "",
        année: student.année || 1,
        status: (student.status || "active") as
          | "active"
          | "inactive"
          | "graduated"
          | "archived",
        address: student.address || "",
      });
    }
  }, [student]);

  // Load student courses (from users/{id}/periods subcollection)
  React.useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const periodsSnap = await getDocs(
          collection(db, "users", studentId, "periods"),
        );

        const periodGroups: Array<{
          period: string;
          years: Array<{
            year: string;
            courses: Array<{ id: string; name: string; professor?: string }>;
          }>;
        }> = [];

        for (const periodDoc of periodsSnap.docs) {
          const periodId = periodDoc.id;
          const coursSnap = await getDocs(
            collection(db, "users", studentId, "periods", periodId, "cours"),
          );

          const courses = await Promise.all(
            coursSnap.docs.map(async (coursDoc) => {
              const courseRef = coursDoc.data().cour;
              const yearId = coursDoc.data().anneeDuCour || "Non spécifié";
              let courseName = coursDoc.id;
              let professor = "";

              if (courseRef) {
                const courseSnap = await getDoc(courseRef);
                if (courseSnap.exists()) {
                  const courseData: any = courseSnap.data();
                  courseName = courseData.nomDuCour || courseSnap.id;
                  if (courseData.profDuCour) {
                    const profSnap = await getDoc(courseData.profDuCour);
                    if (profSnap.exists()) {
                      const profData: any = profSnap.data();
                      professor =
                        `${profData.name || ""} ${profData.prename || ""}`.trim();
                    }
                  }
                }
              }

              return {
                id: coursDoc.id,
                name: courseName,
                year: yearId,
                professor,
              };
            }),
          );

          const yearMap = new Map<
            string,
            Array<{ id: string; name: string; professor?: string }>
          >();

          courses.forEach((course: any) => {
            if (!yearMap.has(course.year)) {
              yearMap.set(course.year, []);
            }
            yearMap.get(course.year)!.push({
              id: course.id,
              name: course.name,
              professor: course.professor || undefined,
            });
          });

          periodGroups.push({
            period: periodId,
            years: Array.from(yearMap.entries()).map(([year, items]) => ({
              year,
              courses: items,
            })),
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

    if (studentId) {
      loadCourses();
    }

    return () => {
      active = false;
    };
  }, [studentId]);

  // Load student history (audit logs)
  React.useEffect(() => {
    if (!studentId) return;
    const q = query(
      collection(db, "auditLogs"),
      where("entityType", "==", "student"),
      where("entityId", "==", studentId),
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
  }, [studentId]);

  const courseCount = useMemo(() => {
    return courseTree.reduce((acc, period) => {
      return (
        acc + period.years.reduce((sum, year) => sum + year.courses.length, 0)
      );
    }, 0);
  }, [courseTree]);

  const completeness = useMemo(() => {
    if (!student) return 0;
    const fields = [
      student.prename,
      student.name,
      student.email,
      student.phone,
      student.dateNaissance,
      student.année,
      student.address,
      student.status,
    ];
    const filled = fields.filter(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    ).length;
    return Math.round((filled / fields.length) * 100);
  }, [student]);

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
      addToast?.(MESSAGES.SUCCESS_UPDATE("Student"), "success");
      setIsEditing(false);
    } catch (err: any) {
      addToast?.(MESSAGES.ERROR_SAVE, "error");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmed = await confirm(
      "Delete Student",
      MESSAGES.CONFIRM_DELETE_STUDENT(student?.name || ""),
      async () => {
        await studentService.deleteStudent(studentId, user.uid);
        addToast?.(MESSAGES.SUCCESS_DELETE("Student"), "success");
        router.push("/students");
      },
      { dangerous: true },
    );
  };

  const handleAssignCourse = async (selection: CourseSelection) => {
    if (!user) return;
    try {
      await addCoursToTheUser(
        studentId,
        selection.yearId,
        selection.periodId,
        selection.courseId,
      );
      addToast?.("Cours assigné à l'étudiant", "success");
      setAssignOpen(false);
    } catch (err) {
      addToast?.("Erreur lors de l'assignation", "error");
    }
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

  if (error || !student) {
    return (
      <Card>
        <div
          style={{
            padding: designSystem.spacing.lg,
            color: designSystem.colors.danger[600],
          }}
        >
          Error loading student
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

          <DatePicker
            label="Date de naissance"
            value={formData.dateNaissance}
            onChange={(e) => setFormData({ ...formData, dateNaissance: e })}
            disabled={!isEditing}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: designSystem.spacing.md,
            }}
          >
            <Select
              label="Année"
              value={String(formData.année)}
              onChange={(e) => setFormData({ ...formData, année: parseInt(e) })}
              options={[
                { value: "1", label: "Année 1" },
                { value: "2", label: "Année 2" },
                { value: "3", label: "Année 3" },
              ]}
              disabled={!isEditing}
            />

            <Select
              label="Statut"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e as any })}
              options={Object.entries(STUDENT_STATUS_LABELS).map(
                ([value, label]) => ({
                  value,
                  label,
                }),
              )}
              disabled={!isEditing}
            />
          </div>

          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            disabled={!isEditing}
            multiline
            rows={3}
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
                    metadata: { type: "course", professor: course.professor },
                  })),
                })),
              }))}
              storageKey={`ihmn_student_courses_${studentId}`}
              renderNode={(node) => {
                if (node.metadata?.type === "course") {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: designSystem.spacing.sm,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{node.label}</span>
                      {node.metadata?.professor ? (
                        <Badge variant="success">
                          {node.metadata.professor}
                        </Badge>
                      ) : (
                        <Badge variant="gray">Sans professeur</Badge>
                      )}
                    </div>
                  );
                }
                return <span>{node.label}</span>;
              }}
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
              {student.prename} {student.name}
            </h1>
            <p
              style={{
                ...designSystem.typography.caption,
                color: designSystem.colors.gray[600],
                margin: "0",
              }}
            >
              {STUDENT_STATUS_LABELS[student.status] || "Inconnu"} • Année{" "}
              {student.année}
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
              <Button variant="ghost" onClick={() => setAssignOpen(true)}>
                Assigner un cours
              </Button>
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

      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assigner un cours"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Annuler
            </Button>
          </>
        }
      >
        <CoursePicker onSelect={handleAssignCourse} />
      </Modal>
    </div>
  );
}
