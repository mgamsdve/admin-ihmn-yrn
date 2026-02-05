"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, DocumentReference, getDoc, onSnapshot, query } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "@/firebase";
import {
  deleteCourses,
  addCoursToTheUser,
  addCourseToTheProffesor,
} from "@/firebaseFun";
import { designSystem } from "@/src/lib/design-system";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { TreeView } from "@/src/components/ui/TreeView";
import { Spinner } from "@/src/components/ui/Spinner";
import { useToast } from "@/src/hooks/useToast";
import CoursNewContent from "@/Components/CoursNewContent";
import FichePresenceNewContent from "@/Components/FichePresenceNewContent";
import { Table } from "@/src/components/ui/Table";

interface CheckedItem {
  period: string;
  annee: string;
  courdocId: string;
}

interface CourseItem {
  nomDuCour: string;
  courdocId: string;
  profDuCour: string;
  profCourId: string;
}

interface StudentItem {
  eleveId: string;
  prenom: string;
  nom: string;
}

export function CoursesManager() {
  const router = useRouter();
  const { addToast } = useToast();
  const [periodsData, setPeriodsData] = useState<string[]>([]);
  const [anneeData, setAnneeData] = useState<Record<string, string[]>>({});
  const [coursData, setCoursData] = useState<Record<string, Record<string, CourseItem[]>>>({});
  const [eleveData, setEleveData] = useState<Record<string, StudentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [courseQuickFilter, setCourseQuickFilter] = useState<
    "all" | "noProfessor" | "noStudents"
  >("all");
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; prename: string; email?: string; year?: string; status?: string }>
  >([]);
  const [professors, setProfessors] = useState<
    Array<{ id: string; name: string; prename: string; email?: string; specialization?: string; status?: string }>
  >([]);
  const [assignStudentsOpen, setAssignStudentsOpen] = useState(false);
  const [assignProfessorsOpen, setAssignProfessorsOpen] = useState(false);
  const [assignStudentSelection, setAssignStudentSelection] = useState<string[]>([]);
  const [assignProfessorSelection, setAssignProfessorSelection] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [professorSearch, setProfessorSearch] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("");
  const [professorSpecFilter, setProfessorSpecFilter] = useState("");
  const [professorStatusFilter, setProfessorStatusFilter] = useState("");
  const [tableDensity, setTableDensity] = useState<"compact" | "comfortable">(
    "comfortable",
  );

  const [checked, setChecked] = useState<CheckedItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const [openCourse, setOpenCourse] = useState(false);
  const [openPresence, setOpenPresence] = useState(false);

  const handleToggle = (period: string, annee: string, courdocId: string) => {
    setChecked((prev) => {
      const index = prev.findIndex(
        (item) => item.period === period && item.annee === annee && item.courdocId === courdocId,
      );
      if (index === -1) {
        return [...prev, { period, annee, courdocId }];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleDelete = async () => {
    if (checked.length === 0) return;
    const confirmDelete = window.confirm(
      "Supprimer les cours sélectionnés ? Les étudiants associés perdront ces cours.",
    );
    if (!confirmDelete) return;

    try {
      for (const cour of checked) {
        await deleteCourses(cour.period, cour.annee, cour.courdocId);
      }
      addToast?.(`${checked.length} cours supprimé(s)`, "success");
      setChecked([]);
    } catch (err) {
      addToast?.("Erreur lors de la suppression", "error");
    }
  };

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    const periodsdocsquery = query(collection(db, "periods"));
    const unsubscribePeriods = onSnapshot(periodsdocsquery, (periodsdocs) => {
      const periods: string[] = [];

      periodsdocs.forEach((perioddoc) => {
        const periodId = perioddoc.id;
        periods.push(periodId);

        const unsubscribeAnnees = onSnapshot(
          query(collection(db, "periods", periodId, "annees")),
          (anneesSnapshot) => {
            const annees: string[] = [];

            anneesSnapshot.forEach((anneeDoc) => {
              const anneeId = anneeDoc.id;
              annees.push(anneeId);

              const unsubscribeCours = onSnapshot(
                query(collection(db, "periods", periodId, "annees", anneeId, "cours")),
                async (coursSnapshot) => {
                  const eleveUpdates: Record<string, StudentItem[]> = {};

                  const cours = await Promise.all(
                    coursSnapshot.docs.map(async (courDoc) => {
                      const courId = courDoc.id;
                      const data = courDoc.data() as {
                        nomDuCour?: string;
                        profDuCour?: DocumentReference;
                        eleves?: DocumentReference[];
                      };

                      let profDuCour = "";
                      let profCourId = "";

                      if (data.profDuCour) {
                        const profData = await getDoc(data.profDuCour);
                        if (profData.exists()) {
                          const datatta: any = profData.data();
                          const profName = datatta.name || "";
                          const profPrename = datatta.prename || "";
                          profDuCour = `${profName} ${profPrename}`.trim();
                          profCourId = profData.id;
                        }
                      }

                      const elevesRefs = data.eleves || [];
                      const eleves = await Promise.all(
                        elevesRefs.map(async (eleveRef) => {
                          try {
                            const eleveDoc: any = await getDoc(eleveRef);
                            if (!eleveDoc.exists()) return null;
                            return {
                              eleveId: eleveDoc.id,
                              prenom: eleveDoc.data().prename,
                              nom: eleveDoc.data().name,
                            } as StudentItem;
                          } catch (e) {
                            return null;
                          }
                        }),
                      );

                      eleveUpdates[`${periodId}-${courId}`] = eleves.filter(Boolean) as StudentItem[];

                      return {
                        nomDuCour: data.nomDuCour || courId,
                        courdocId: courId,
                        profDuCour,
                        profCourId,
                      } as CourseItem;
                    }),
                  );

                  setCoursData((prevCoursData) => ({
                    ...prevCoursData,
                    [periodId]: {
                      ...prevCoursData[periodId],
                      [anneeId]: cours,
                    },
                  }));

                  setEleveData((prevEleveData) => ({
                    ...prevEleveData,
                    ...eleveUpdates,
                  }));
                },
              );

              unsubscribes.push(unsubscribeCours);
            });

            setAnneeData((prevAnneeData) => ({
              ...prevAnneeData,
              [periodId]: annees,
            }));
          },
        );

        unsubscribes.push(unsubscribeAnnees);
      });

      setPeriodsData(periods);
      setLoading(false);
    });

    unsubscribes.push(unsubscribePeriods);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs
        .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
        .filter((doc: any) => doc.role === "student" || (!doc.role && doc.prename && doc.name))
        .map((doc: any) => ({
          id: doc.id,
          name: doc.name || "",
          prename: doc.prename || "",
          email: doc.email || "",
          year: String(doc.année ?? doc.annee ?? ""),
          status: doc.status || "active",
        }));
      setStudents(data);
    });

    const unsubscribeProfessors = onSnapshot(collection(db, "profs"), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name || "",
        prename: docSnap.data().prename || "",
        email: docSnap.data().email || "",
        specialization: docSnap.data().specialization || docSnap.data().specialite || "",
        status: docSnap.data().status || "active",
      }));
      setProfessors(data);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeProfessors();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ihmn_settings");
    if (!stored) return;
    const settings = JSON.parse(stored);
    if (settings.compactTables) {
      setTableDensity("compact");
    }
  }, []);

  const filteredPeriods = periodsData.filter((period) =>
    period.toLowerCase().includes(periodFilter.toLowerCase()),
  );

  const filterCourses = (data: CourseItem[]) =>
    data.filter((cour) => cour.nomDuCour.toLowerCase().includes(searchValue.toLowerCase()));

  const flatCourses = useMemo(() => {
    const rows: Array<{
      id: string;
      period: string;
      year: string;
      course: string;
      courseId: string;
      professor: string;
      studentsCount: number;
    }> = [];

    periodsData.forEach((period) => {
      (anneeData[period] || []).forEach((annee) => {
        (coursData[period]?.[annee] || []).forEach((course) => {
          const students = eleveData[`${period}-${course.courdocId}`] || [];
          rows.push({
            id: `${period}-${annee}-${course.courdocId}`,
            period,
            year: annee,
            course: course.nomDuCour,
            courseId: course.courdocId,
            professor: course.profDuCour || "",
            studentsCount: students.length,
          });
        });
      });
    });

    return rows.filter((row) => {
      const matchesSearch = row.course.toLowerCase().includes(searchValue.toLowerCase());
      const matchesPeriod = row.period.toLowerCase().includes(periodFilter.toLowerCase());
      const matchesQuick = (() => {
        switch (courseQuickFilter) {
          case "noProfessor":
            return !row.professor;
          case "noStudents":
            return row.studentsCount === 0;
          default:
            return true;
        }
      })();
      return matchesSearch && matchesPeriod && matchesQuick;
    });
  }, [periodsData, anneeData, coursData, eleveData, searchValue, periodFilter, courseQuickFilter]);

  const courseStats = useMemo(() => {
    const totalCourses = flatCourses.length;
    const withProf = flatCourses.filter((row) => row.professor).length;
    const noProf = flatCourses.filter((row) => !row.professor).length;
    const noStudents = flatCourses.filter((row) => row.studentsCount === 0).length;
    return { totalCourses, withProf, noProf, noStudents };
  }, [flatCourses]);

  const nodes = useMemo(() => {
    return filteredPeriods.map((period) => ({
      id: `period-${period}`,
      label: period,
      metadata: { type: "period" },
      children: (anneeData[period] || []).map((annee) => ({
        id: `period-${period}-year-${annee}`,
        label: annee,
        metadata: { type: "year" },
        children: filterCourses(coursData[period]?.[annee] || []).map((cour) => ({
          id: `period-${period}-year-${annee}-course-${cour.courdocId}`,
          label: cour.nomDuCour,
          metadata: {
            type: "course",
            period,
            annee,
            courseId: cour.courdocId,
            profName: cour.profDuCour,
            profId: cour.profCourId,
          },
          children: (eleveData[`${period}-${cour.courdocId}`] || []).map((student) => ({
            id: `student-${student.eleveId}`,
            label: `${student.prenom} ${student.nom}`,
            metadata: { type: "student", studentId: student.eleveId },
          })),
        })),
      })),
    }));
  }, [anneeData, coursData, eleveData, filteredPeriods, searchValue]);

  const selectedCount = checked.length;
  const selectedCourse = selectedCount === 1 ? checked[0] : null;

  const selectedCourseLabel = useMemo(() => {
    if (!selectedCourse) return "";
    const course = coursData[selectedCourse.period]?.[selectedCourse.annee]?.find(
      (item) => item.courdocId === selectedCourse.courdocId,
    );
    return course?.nomDuCour || selectedCourse.courdocId;
  }, [selectedCourse, coursData]);

  const courseById = useMemo(() => {
    const map = new Map<string, { period: string; annee: string; courdocId: string }>();
    periodsData.forEach((period) => {
      (anneeData[period] || []).forEach((annee) => {
        (coursData[period]?.[annee] || []).forEach((course) => {
          map.set(`${period}-${annee}-${course.courdocId}`, {
            period,
            annee,
            courdocId: course.courdocId,
          });
        });
      });
    });
    return map;
  }, [periodsData, anneeData, coursData]);

  const handleTableSelection = (ids: string[]) => {
    const mapped = ids
      .map((id) => courseById.get(id))
      .filter(Boolean) as CheckedItem[];
    setChecked(mapped);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      `${student.prename} ${student.name} ${student.email || ""}`
        .toLowerCase()
        .includes(studentSearch.toLowerCase()),
    );
  }, [students, studentSearch]);

  const filteredStudentsWithFilters = useMemo(() => {
    return filteredStudents.filter((student) => {
      const matchesYear = studentYearFilter ? student.year === studentYearFilter : true;
      const matchesStatus = studentStatusFilter ? student.status === studentStatusFilter : true;
      return matchesYear && matchesStatus;
    });
  }, [filteredStudents, studentYearFilter, studentStatusFilter]);

  const filteredProfessors = useMemo(() => {
    return professors.filter((prof) =>
      `${prof.prename} ${prof.name} ${prof.email || ""}`
        .toLowerCase()
        .includes(professorSearch.toLowerCase()),
    );
  }, [professors, professorSearch]);

  const filteredProfessorsWithFilters = useMemo(() => {
    return filteredProfessors.filter((prof) => {
      const matchesSpec = professorSpecFilter ? prof.specialization === professorSpecFilter : true;
      const matchesStatus = professorStatusFilter ? prof.status === professorStatusFilter : true;
      return matchesSpec && matchesStatus;
    });
  }, [filteredProfessors, professorSpecFilter, professorStatusFilter]);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.year).filter(Boolean))).sort();
  }, [students]);

  const specializationOptions = useMemo(() => {
    return Array.from(new Set(professors.map((p) => p.specialization).filter(Boolean))).sort();
  }, [professors]);

  const handleOpenAssignStudents = () => {
    if (!selectedCourse) {
      addToast?.("Sélectionnez un cours (1 seul)", "warning");
      return;
    }
    setAssignStudentsOpen(true);
  };

  const handleOpenAssignProfessors = () => {
    if (!selectedCourse) {
      addToast?.("Sélectionnez un cours (1 seul)", "warning");
      return;
    }
    setAssignProfessorsOpen(true);
  };

  const handleAssignStudents = async () => {
    if (!selectedCourse) return;
    try {
      for (const studentId of assignStudentSelection) {
        await addCoursToTheUser(
          studentId,
          selectedCourse.annee,
          selectedCourse.period,
          selectedCourse.courdocId,
        );
      }
      addToast?.("Étudiants assignés au cours", "success");
      setAssignStudentSelection([]);
      setAssignStudentsOpen(false);
    } catch (err) {
      addToast?.("Erreur lors de l'assignation", "error");
    }
  };

  const handleAssignProfessors = async () => {
    if (!selectedCourse) return;
    try {
      for (const professorId of assignProfessorSelection) {
        await addCourseToTheProffesor(
          professorId,
          selectedCourse.annee,
          selectedCourse.period,
          selectedCourse.courdocId,
        );
      }
      addToast?.("Professeurs assignés au cours", "success");
      setAssignProfessorSelection([]);
      setAssignProfessorsOpen(false);
    } catch (err) {
      addToast?.("Erreur lors de l'assignation", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.lg }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: designSystem.spacing.md,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              ...designSystem.typography.h1,
              color: designSystem.colors.text.primary,
              marginBottom: designSystem.spacing.xs,
            }}
          >
            Cours & Assignations
          </div>
          <div style={{ ...designSystem.typography.body, color: designSystem.colors.text.secondary }}>
            Gérez les cours, affectations et présences depuis un seul espace fluide.
          </div>
        </div>
        <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
          <Button variant="primary" onClick={() => setOpenCourse(true)}>
            + Nouveau cours
          </Button>
          <Button variant="secondary" onClick={() => setOpenPresence(true)}>
            Créer une fiche
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <Card>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 220px) auto auto",
            gap: designSystem.spacing.md,
            alignItems: "end",
          }}
        >
          <SearchInput onSearch={setSearchValue} placeholder="Rechercher un cours..." />
          <Input
            label="Période"
            placeholder="ex: 2024-2025"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          />
          <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
            <Button
              variant={viewMode === "tree" ? "secondary" : "ghost"}
              onClick={() => setViewMode("tree")}
            >
              Arborescence
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              onClick={() => setViewMode("table")}
            >
              Tableau
            </Button>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={selectedCount === 0}
          >
            Supprimer ({selectedCount})
          </Button>
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: designSystem.spacing.md,
        }}
      >
        {[
          { label: "Cours totaux", value: courseStats.totalCourses, icon: "📚" },
          { label: "Cours avec prof", value: courseStats.withProf, icon: "👨‍🏫" },
          { label: "Cours sans prof", value: courseStats.noProf, icon: "⚠️" },
          { label: "Cours sans étudiants", value: courseStats.noStudents, icon: "👥" },
        ].map((item) => (
          <Card
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: designSystem.spacing.md,
              border: `1px solid ${designSystem.colors.gray[200]}`,
              background: "#ffffff",
            }}
          >
            <div>
              <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                {item.label}
              </div>
              <div style={{ ...designSystem.typography.h2, color: designSystem.colors.text.primary }}>
                {item.value}
              </div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: designSystem.borderRadius.md,
                backgroundColor: designSystem.colors.gray[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {item.icon}
            </div>
          </Card>
        ))}
      </div>

      {selectedCount > 0 && (
        <Card
          style={{
            background: "#ffffff",
            border: `1px solid ${designSystem.colors.gray[200]}`,
          }}
        >
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
              <div style={{ ...designSystem.typography.h4, color: designSystem.colors.text.primary }}>
                {selectedCourse
                  ? `Cours sélectionné: ${selectedCourseLabel}`
                  : `${selectedCount} cours sélectionnés`}
              </div>
              <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                Actions rapides pour assigner sans quitter la page.
              </div>
            </div>
            <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
              <Button
                variant="secondary"
                onClick={handleOpenAssignStudents}
                disabled={!selectedCourse}
              >
                Assigner étudiants
              </Button>
              <Button
                variant="secondary"
                onClick={handleOpenAssignProfessors}
                disabled={!selectedCourse}
              >
                Assigner profs
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tree */}
      <Card>
        <div
          style={{
            display: "flex",
            gap: designSystem.spacing.sm,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: designSystem.spacing.md,
          }}
        >
          <span style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Filtres rapides
          </span>
          <Button
            variant={courseQuickFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCourseQuickFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={courseQuickFilter === "noProfessor" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCourseQuickFilter("noProfessor")}
          >
            Sans prof
          </Button>
          <Button
            variant={courseQuickFilter === "noStudents" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCourseQuickFilter("noStudents")}
          >
            Sans étudiants
          </Button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: designSystem.spacing.xl }}>
            <Spinner />
          </div>
        ) : viewMode === "tree" ? (
          nodes.length === 0 ? (
            <div style={{ textAlign: "center", padding: designSystem.spacing.xl }}>
              <div style={{ fontSize: "40px", marginBottom: designSystem.spacing.sm }}>📚</div>
              <div style={{ ...designSystem.typography.body, color: designSystem.colors.text.secondary }}>
                Aucun cours trouvé
              </div>
            </div>
          ) : (
            <TreeView
              nodes={nodes}
              storageKey="ihmn_courses_tree"
              renderNode={(node) => {
                const type = node.metadata?.type as string | undefined;

                if (type === "course") {
                  const isChecked = checked.some(
                    (item) =>
                      item.period === node.metadata?.period &&
                      item.annee === node.metadata?.annee &&
                      item.courdocId === node.metadata?.courseId,
                  );
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: designSystem.spacing.sm,
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          handleToggle(
                            node.metadata?.period,
                            node.metadata?.annee,
                            node.metadata?.courseId,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>{node.label}</span>
                      {node.metadata?.profName ? (
                        <Badge variant="success">{node.metadata.profName}</Badge>
                      ) : (
                        <Badge variant="gray">Sans professeur</Badge>
                      )}
                    {node.metadata?.profId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/professors/${node.metadata.profId}`);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: designSystem.colors.primary[600],
                          cursor: "pointer",
                          ...designSystem.typography.bodySmall,
                        }}
                      >
                        Voir le professeur
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/courses/${node.metadata?.courseId}?period=${encodeURIComponent(
                            node.metadata?.period,
                          )}&year=${encodeURIComponent(node.metadata?.annee)}`,
                        );
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: designSystem.colors.text.secondary,
                        cursor: "pointer",
                        ...designSystem.typography.bodySmall,
                      }}
                    >
                      Détails
                    </button>
                  </div>
                );
              }

                if (type === "student") {
                  return (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/students/${node.metadata?.studentId}`);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: designSystem.colors.gray[800],
                        cursor: "pointer",
                        ...designSystem.typography.bodySmall,
                      }}
                    >
                      {node.label}
                    </button>
                  );
                }

                return <span>{node.label}</span>;
              }}
            />
          )
        ) : (
          <Table
            columns={[
              { key: "period", label: "Période", width: 120 },
              { key: "year", label: "Année", width: 100 },
              { key: "course", label: "Cours", minWidth: 180 },
              {
                key: "professor",
                label: "Professeur",
                render: (value) =>
                  value ? (
                    <Badge variant="success">{value}</Badge>
                  ) : (
                    <Badge variant="gray">Sans professeur</Badge>
                  ),
              },
              {
                key: "studentsCount",
                label: "Étudiants",
                width: 120,
                render: (value) => <Badge variant="primary">{value}</Badge>,
              },
            ]}
            data={flatCourses}
            selectable
            onSelectionChange={handleTableSelection}
            configKey="courses"
            showPreferences
            density={tableDensity}
            onRowClick={(row) => {
              router.push(
                `/courses/${row.courseId}?period=${encodeURIComponent(
                  row.period,
                )}&year=${encodeURIComponent(row.year)}`,
              );
            }}
            emptyState={
              <div style={{ textAlign: "center", padding: designSystem.spacing.lg }}>
                Aucun cours trouvé
              </div>
            }
          />
        )}
      </Card>

      <Modal
        isOpen={openCourse}
        onClose={() => setOpenCourse(false)}
        title="Ajouter un cours"
        size="md"
      >
        <CoursNewContent handleClose={() => setOpenCourse(false)} />
      </Modal>

      <Modal
        isOpen={openPresence}
        onClose={() => setOpenPresence(false)}
        title="Créer une fiche de présence"
        size="lg"
      >
        <FichePresenceNewContent close={() => setOpenPresence(false)} />
      </Modal>

      <Modal
        isOpen={assignStudentsOpen}
        onClose={() => setAssignStudentsOpen(false)}
        title={`Assigner des étudiants • ${selectedCourseLabel}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignStudentsOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleAssignStudents}>
              Assigner ({assignStudentSelection.length})
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
          <SearchInput onSearch={setStudentSearch} placeholder="Rechercher un étudiant..." />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: designSystem.spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  ...designSystem.typography.bodySmall,
                  color: designSystem.colors.text.secondary,
                  display: "block",
                  marginBottom: designSystem.spacing.xs,
                }}
              >
                Année courante
              </label>
              <select
                value={studentYearFilter}
                onChange={(e) => setStudentYearFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                }}
              >
                <option value="">Toutes</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    Année {year}
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
                Statut
              </label>
              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                }}
              >
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="graduated">Diplômé</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
          <Table
            columns={[
              { key: "prename", label: "Nom" },
              { key: "name", label: "Prénom" },
              {
                key: "email",
                label: "Email",
                render: (value) => (
                  <span style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                    {value || "-"}
                  </span>
                ),
              },
            ]}
            data={filteredStudentsWithFilters}
            selectable
            onSelectionChange={setAssignStudentSelection}
            emptyState={<div style={{ padding: designSystem.spacing.lg }}>Aucun étudiant trouvé</div>}
          />
        </div>
      </Modal>

      <Modal
        isOpen={assignProfessorsOpen}
        onClose={() => setAssignProfessorsOpen(false)}
        title={`Assigner des professeurs • ${selectedCourseLabel}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignProfessorsOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleAssignProfessors}>
              Assigner ({assignProfessorSelection.length})
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
          <SearchInput onSearch={setProfessorSearch} placeholder="Rechercher un professeur..." />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: designSystem.spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  ...designSystem.typography.bodySmall,
                  color: designSystem.colors.text.secondary,
                  display: "block",
                  marginBottom: designSystem.spacing.xs,
                }}
              >
                Spécialité
              </label>
              <select
                value={professorSpecFilter}
                onChange={(e) => setProfessorSpecFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                }}
              >
                <option value="">Toutes</option>
                {specializationOptions.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
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
                Statut
              </label>
              <select
                value={professorStatusFilter}
                onChange={(e) => setProfessorStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                }}
              >
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="on_leave">En congé</option>
              </select>
            </div>
          </div>
          <Table
            columns={[
              { key: "prename", label: "Nom" },
              { key: "name", label: "Prénom" },
              {
                key: "email",
                label: "Email",
                render: (value) => (
                  <span style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                    {value || "-"}
                  </span>
                ),
              },
            ]}
            data={filteredProfessorsWithFilters}
            selectable
            onSelectionChange={setAssignProfessorSelection}
            emptyState={<div style={{ padding: designSystem.spacing.lg }}>Aucun professeur trouvé</div>}
          />
        </div>
      </Modal>
    </div>
  );
}
