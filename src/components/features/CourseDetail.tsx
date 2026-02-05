"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { designSystem } from "@/src/lib/design-system";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";

export function CourseDetail() {
  const router = useRouter();
  const { id, period, year } = router.query;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [professor, setProfessor] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !period || !year) return;
    const load = async () => {
      setLoading(true);
      const courseRef = doc(db, "periods", String(period), "annees", String(year), "cours", String(id));
      const snapshot = await getDoc(courseRef);
      if (!snapshot.exists()) {
        setCourse(null);
        setLoading(false);
        return;
      }

      const data: any = snapshot.data();
      setCourse({ id: snapshot.id, ...data });

      if (data.profDuCour) {
        const profSnap = await getDoc(data.profDuCour);
        if (profSnap.exists()) {
          setProfessor({ id: profSnap.id, ...profSnap.data() });
        }
      }

      if (data.eleves && Array.isArray(data.eleves)) {
        const studentDocs = await Promise.all(
          data.eleves.map((ref: any) => getDoc(ref))
        );
        setStudents(
          studentDocs
            .filter((docSnap) => docSnap.exists())
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        );
      } else {
        setStudents([]);
      }

      setLoading(false);
    };

    load();
  }, [id, period, year]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: designSystem.spacing.xl }}>
        <Spinner />
      </div>
    );
  }

  if (!course) {
    return (
      <Card>
        <div style={{ ...designSystem.typography.body, color: designSystem.colors.text.secondary }}>
          Cours introuvable.
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ ...designSystem.typography.h2 }}>{course.nomDuCour || course.id}</div>
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            {String(period)} • {String(year)}
          </div>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          Retour
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: designSystem.spacing.md,
        }}
      >
        <Card>
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Professeur
          </div>
          <div style={{ ...designSystem.typography.h4 }}>
            {professor ? `${professor.name || ""} ${professor.prename || ""}`.trim() : "Non assigné"}
          </div>
          {professor && (
            <Badge variant="success" size="sm">
              {professor.specialization || professor.specialite || ""}
            </Badge>
          )}
        </Card>
        <Card>
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Étudiants
          </div>
          <div style={{ ...designSystem.typography.h4 }}>{students.length}</div>
        </Card>
      </div>

      <Card>
        <div style={{ ...designSystem.typography.h3, marginBottom: designSystem.spacing.md }}>
          Étudiants inscrits
        </div>
        {students.length === 0 ? (
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
            Aucun étudiant inscrit.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.sm }}>
            {students.map((student) => (
              <div
                key={student.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: designSystem.spacing.sm,
                  border: `1px solid ${designSystem.colors.gray[200]}`,
                  borderRadius: designSystem.borderRadius.md,
                }}
              >
                <span>
                  {student.prename} {student.name}
                </span>
                <Badge variant="gray">{student.email || "Sans email"}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
