"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, getDoc, getDocs, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { designSystem } from "@/src/lib/design-system";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { TreeView } from "@/src/components/ui/TreeView";

interface CourseSelection {
  periodId: string;
  yearId: string;
  courseId: string;
  courseName: string;
}

interface CoursePickerProps {
  onSelect: (selection: CourseSelection) => void;
  selected?: CourseSelection | null;
}

export function CoursePicker({ onSelect, selected }: CoursePickerProps) {
  const [periods, setPeriods] = useState<string[]>([]);
  const [annees, setAnnees] = useState<Record<string, string[]>>({});
  const [courses, setCourses] = useState<
    Record<string, Record<string, Array<{ id: string; name: string; prof?: string }>>>
  >({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    const unsubscribePeriods = onSnapshot(
      query(collection(db, "periods")),
      (snapshot) => {
        const periodIds = snapshot.docs.map((doc) => doc.id);
        setPeriods(periodIds);

        periodIds.forEach((periodId) => {
          const unsubscribeAnnees = onSnapshot(
            query(collection(db, "periods", periodId, "annees")),
            (anneesSnap) => {
              const yearIds = anneesSnap.docs.map((doc) => doc.id);
              setAnnees((prev) => ({ ...prev, [periodId]: yearIds }));

              yearIds.forEach((yearId) => {
                const unsubscribeCourses = onSnapshot(
                  query(collection(db, "periods", periodId, "annees", yearId, "cours")),
                  async (coursSnap) => {
                    const rows = await Promise.all(
                      coursSnap.docs.map(async (docSnap) => {
                        const data: any = docSnap.data();
                        let profName = "";
                        if (data.profDuCour) {
                          const profSnap = await getDoc(data.profDuCour);
                          if (profSnap.exists()) {
                            const profData: any = profSnap.data();
                            profName = `${profData.name || ""} ${profData.prename || ""}`.trim();
                          }
                        }
                        return {
                          id: docSnap.id,
                          name: data.nomDuCour || docSnap.id,
                          prof: profName,
                        };
                      }),
                    );

                    setCourses((prev) => ({
                      ...prev,
                      [periodId]: {
                        ...prev[periodId],
                        [yearId]: rows,
                      },
                    }));
                  },
                );

                unsubscribes.push(unsubscribeCourses);
              });
            },
          );

          unsubscribes.push(unsubscribeAnnees);
        });
      },
    );

    unsubscribes.push(unsubscribePeriods);

    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, []);

  const nodes = useMemo(() => {
    return periods.map((periodId) => ({
      id: `period-${periodId}`,
      label: periodId,
      children: (annees[periodId] || []).map((yearId) => ({
        id: `period-${periodId}-year-${yearId}`,
        label: yearId,
        children: (courses[periodId]?.[yearId] || [])
          .filter((course) =>
            course.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((course) => ({
            id: `course-${periodId}-${yearId}-${course.id}`,
            label: course.name,
            metadata: {
              periodId,
              yearId,
              courseId: course.id,
              courseName: course.name,
              prof: course.prof,
            },
          })),
      })),
    }));
  }, [periods, annees, courses, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
      <SearchInput onSearch={setSearch} placeholder="Rechercher un cours..." />
      <Card>
        {nodes.length === 0 ? (
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Aucun cours disponible
          </div>
        ) : (
          <TreeView
            nodes={nodes}
            renderNode={(node) => {
              const meta = node.metadata as any;
              if (!meta?.courseId) return <span>{node.label}</span>;

              const isSelected =
                selected?.courseId === meta.courseId &&
                selected?.periodId === meta.periodId &&
                selected?.yearId === meta.yearId;

              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect({
                      periodId: meta.periodId,
                      yearId: meta.yearId,
                      courseId: meta.courseId,
                      courseName: meta.courseName,
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: designSystem.spacing.sm,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: isSelected
                      ? designSystem.colors.primary[600]
                      : designSystem.colors.gray[900],
                  }}
                >
                  <span>{node.label}</span>
                  {meta.prof ? (
                    <Badge variant="success" size="sm">
                      {meta.prof}
                    </Badge>
                  ) : (
                    <Badge variant="gray" size="sm">
                      Sans prof
                    </Badge>
                  )}
                </button>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}

export type { CourseSelection };
