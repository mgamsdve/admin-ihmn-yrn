"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";
import { NotificationsCenter } from "@/src/components/features/NotificationsCenter";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "@/src/lib/design-system";

interface StatCard {
  label: string;
  value: number | string | React.ReactNode;
  variant: "primary" | "success" | "danger" | "warning";
  trend?: { value: number; direction: "up" | "down" };
}

const StatCard: React.FC<StatCard> = ({ label, value, variant, trend }) => {
  const variantColors: Record<
    string,
    { bg: string; text: string; light: string }
  > = {
    primary: {
      bg: colors.primary[50],
      text: colors.primary[700],
      light: colors.primary[100],
    },
    success: {
      bg: colors.success[50],
      text: colors.success[700],
      light: colors.success[100],
    },
    danger: {
      bg: colors.danger[50],
      text: colors.danger[700],
      light: colors.danger[100],
    },
    warning: {
      bg: colors.warning[50],
      text: colors.warning[700],
      light: colors.warning[100],
    },
  };

  const config = variantColors[variant];

  return (
    <Card
      hoverable
      style={{
        backgroundColor: "white",
        border: `1px solid ${colors.border}`,
        boxShadow: "none",
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing[3],
        }}
      >
        <div>
          <div
            style={{
              ...typography.bodySmall,
              color: colors.text.secondary,
              marginBottom: spacing[1],
            }}
          >
            {label}
          </div>
          <div
            style={{
              ...typography.h2,
              color: colors.text.primary,
            }}
          >
            {value}
          </div>
          {trend && (
            <div
              style={{
                marginTop: spacing[1],
                ...typography.bodySmall,
                color:
                  trend.direction === "up"
                    ? colors.success[600]
                    : colors.danger[600],
              }}
            >
              {trend.direction === "up" ? "▲" : "▼"} {trend.value}% ce mois
            </div>
          )}
        </div>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: borderRadius.full,
            backgroundColor: config.text,
          }}
        />
      </div>
    </Card>
  );
};

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  color: string;
}> = ({ title, description, icon, onClick, color }) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        cursor: "pointer",
        border: `1px solid ${colors.border}`,
        boxShadow: "none",
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: spacing[3] }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: borderRadius.md,
            backgroundColor: `${color}12`,
            border: `1px solid ${color}33`,
            fontSize: "16px",
            color,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              ...typography.h4,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {title}
          </div>
          <div
            style={{
              ...typography.bodySmall,
              color: colors.text.secondary,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [],
  );
  const [stats, setStats] = useState<{
    students: number;
    professors: number;
    courses: number;
    attendances: number;
  }>({
    students: 0,
    professors: 0,
    courses: 0,
    attendances: 0,
  });

  const [loading, setLoading] = useState(true);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [professorRecords, setProfessorRecords] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [onboarding, setOnboarding] = useState<Record<string, boolean>>({});
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter(
            (doc: any) =>
              doc.role === "student" || (!doc.role && doc.prename && doc.name),
          );
        setStudentRecords(data);
        setStats((prev) => ({ ...prev, students: data.length }));
      },
    );

    const unsubscribeProfessors = onSnapshot(
      collection(db, "profs"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setProfessorRecords(data);
        setStats((prev) => ({ ...prev, professors: data.length }));
      },
    );

    const activityQuery = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc"),
      limit(6),
    );
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecentActivity(logs);
    });

    setLoading(false);

    return () => {
      unsubscribeStudents();
      unsubscribeProfessors();
      unsubscribeActivity();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ihmn_onboarding");
    if (stored) {
      const parsed = JSON.parse(stored);
      setOnboarding(parsed);
      setShowOnboarding(!parsed.completed);
    }
    const settingsStored = window.localStorage.getItem("ihmn_settings");
    if (settingsStored) {
      const settings = JSON.parse(settingsStored);
      if (settings.showOnboarding === false) {
        setShowOnboarding(false);
      }
    }
  }, []);

  const updateOnboarding = (key: string, value: boolean) => {
    const next = { ...onboarding, [key]: value };
    const completed = ["students", "professors", "courses", "attendance"].every(
      (item) => next[item],
    );
    const payload = { ...next, completed };
    setOnboarding(payload);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ihmn_onboarding", JSON.stringify(payload));
    }
    setShowOnboarding(!completed);
  };

  const dataQuality = useMemo(() => {
    const missingStudentEmail = studentRecords.filter((s) => !s.email).length;
    const missingStudentPhone = studentRecords.filter((s) => !s.phone).length;
    const missingStudentYear = studentRecords.filter((s) => !s.annee && !s.année).length;

    const missingProfEmail = professorRecords.filter((p) => !p.email).length;
    const missingProfPhone = professorRecords.filter((p) => !p.phone).length;
    const missingProfSpec = professorRecords.filter(
      (p) => !(p.specialite || p.specialization),
    ).length;

    return [
      {
        label: "Étudiants sans email",
        value: missingStudentEmail,
        variant: "warning" as const,
      },
      {
        label: "Étudiants sans année",
        value: missingStudentYear,
        variant: "danger" as const,
      },
      {
        label: "Étudiants sans téléphone",
        value: missingStudentPhone,
        variant: "warning" as const,
      },
      {
        label: "Professeurs sans email",
        value: missingProfEmail,
        variant: "warning" as const,
      },
      {
        label: "Professeurs sans spécialité",
        value: missingProfSpec,
        variant: "danger" as const,
      },
      {
        label: "Professeurs sans téléphone",
        value: missingProfPhone,
        variant: "warning" as const,
      },
    ];
  }, [studentRecords, professorRecords]);

  const studentStats = useMemo(
    () => ({
      missingEmail: studentRecords.filter((s) => !s.email).length,
      missingPhone: studentRecords.filter((s) => !s.phone).length,
      missingYear: studentRecords.filter((s) => !s.annee && !s.année).length,
    }),
    [studentRecords],
  );

  const professorStats = useMemo(
    () => ({
      missingEmail: professorRecords.filter((p) => !p.email).length,
      missingPhone: professorRecords.filter((p) => !p.phone).length,
      missingSpec: professorRecords.filter(
        (p) => !(p.specialite || p.specialization),
      ).length,
    }),
    [professorRecords],
  );

  const formatTime = (value: any) => {
    if (!value) return "-";
    if (typeof value.toDate === "function") {
      return value.toDate().toLocaleString("fr-FR");
    }
    if (value instanceof Date) {
      return value.toLocaleString("fr-FR");
    }
    return new Date(value).toLocaleString("fr-FR");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing[6] }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing[4],
        }}
      >
        <div>
          <div
            style={{
              ...typography.h1,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            Tableau de bord
          </div>
          <div
            style={{
              ...typography.body,
              color: colors.text.secondary,
            }}
          >
            {today} • Pilotage rapide de l'établissement
          </div>
        </div>
        <div style={{ display: "flex", gap: spacing[2] }}>
          <Button
            variant="secondary"
            onClick={() => router.push("/students")}
          >
            Nouvel étudiant
          </Button>
          <Button variant="primary" onClick={() => router.push("/courses")}>
            Nouveau cours
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: spacing[4],
        }}
      >
        <StatCard
          label="Étudiants inscrits"
          value={loading ? <Spinner size="sm" /> : stats.students}
          variant="primary"
          trend={{ value: 12, direction: "up" }}
        />
        <StatCard
          label="Professeurs actifs"
          value={loading ? <Spinner size="sm" /> : stats.professors}
          variant="success"
          trend={{ value: 5, direction: "up" }}
        />
        <StatCard
          label="Cours offerts"
          value={stats.courses || 0}
          variant="warning"
        />
        <StatCard
          label="Feuilles de présence"
          value={stats.attendances || 0}
          variant="danger"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div
          style={{
            ...typography.h3,
            color: colors.text.primary,
            marginBottom: spacing[4],
          }}
        >
          Actions rapides
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: spacing[4],
          }}
        >
          <QuickActionCard
            title="Ajouter étudiant"
            description="Créer un nouveau profil d'étudiant"
            icon="+"
            onClick={() => router.push("/students")}
            color={colors.primary[600]}
          />
          <QuickActionCard
            title="Ajouter professeur"
            description="Créer un nouveau profil de professeur"
            icon="+"
            onClick={() => router.push("/professors")}
            color={colors.success[600]}
          />
          <QuickActionCard
            title="Gérer cours"
            description="Créer et organiser les cours"
            icon="•"
            onClick={() => router.push("/courses")}
            color={colors.warning[600]}
          />
          <QuickActionCard
            title="Feuille de présence"
            description="Créer et exporter des présences"
            icon="•"
            onClick={() => router.push("/attendance")}
            color={colors.danger[600]}
          />
        </div>
      </div>

      {/* Activity + Alerts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: spacing[4],
        }}
      >
        <Card>
          <div
            style={{
              ...typography.h3,
              color: colors.text.primary,
              marginBottom: spacing[3],
            }}
          >
            Activité récente
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing[3],
            }}
          >
            {recentActivity.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: spacing[6],
                  color: colors.text.secondary,
                  ...typography.body,
                }}
              >
                Aucune activité récente
              </div>
            ) : (
              recentActivity.map((activity, idx) => {
                const actionColor =
                  activity.action === "create"
                    ? colors.success[600]
                    : activity.action === "update"
                      ? colors.primary[600]
                      : activity.action === "delete"
                        ? colors.danger[600]
                        : colors.gray[400];
                return (
                  <div
                    key={activity.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: spacing[3],
                      borderBottom:
                        idx < recentActivity.length - 1
                          ? `1px solid ${colors.border}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: spacing[3],
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: borderRadius.full,
                          backgroundColor: actionColor,
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          ...typography.body,
                          color: colors.text.primary,
                        }}
                      >
                        {activity.action?.toUpperCase() || "ACTION"} •{" "}
                        {activity.entityType}
                      </span>
                    </div>
                    <Badge variant="gray" size="sm">
                      {formatTime(activity.timestamp)}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <NotificationsCenter
          studentStats={studentStats}
          professorStats={professorStats}
        />
      </div>

      {/* Data Quality */}
      <div>
        <div
          style={{
            ...typography.h3,
            color: colors.text.primary,
            marginBottom: spacing[4],
          }}
        >
          Qualité des données
        </div>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
            {dataQuality.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: spacing[3],
                  borderBottom:
                    idx < dataQuality.length - 1
                      ? `1px solid ${colors.border}`
                      : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      ...typography.bodySmall,
                      color: colors.text.secondary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ ...typography.h4, color: colors.text.primary }}>
                    {item.value}
                  </div>
                </div>
                <Badge
                  variant={
                    item.variant === "danger"
                      ? "danger"
                      : item.variant === "warning"
                        ? "warning"
                        : "primary"
                  }
                  size="sm"
                >
                  Action requise
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Productivity */}
      <Card>
        <div
          style={{
            ...typography.h3,
            color: colors.text.primary,
            marginBottom: spacing[3],
          }}
        >
          Raccourcis productivité
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing[3],
          }}
        >
          <Button variant="secondary" onClick={() => router.push("/students")}>
            Importer étudiants
          </Button>
          <Button variant="secondary" onClick={() => router.push("/professors")}>
            Importer professeurs
          </Button>
          <Button variant="secondary" onClick={() => router.push("/audit")}>
            Voir audit
          </Button>
          <Button variant="secondary" onClick={() => router.push("/settings")}>
            Paramètres
          </Button>
        </div>
      </Card>

      {showOnboarding && (
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing[4],
            }}
          >
            <div>
              <div
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  marginBottom: spacing[1],
                }}
              >
                Démarrage guidé
              </div>
              <div style={{ ...typography.bodySmall, color: colors.text.secondary }}>
                Suivez ces étapes pour démarrer rapidement la plateforme.
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowOnboarding(false)}
            >
              Masquer
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
            {[
              {
                key: "students",
                title: "Ajouter des étudiants",
                description: "Créez ou importez les premiers profils.",
                action: () => router.push("/students"),
              },
              {
                key: "professors",
                title: "Ajouter des professeurs",
                description: "Renseignez les enseignants clés.",
                action: () => router.push("/professors"),
              },
              {
                key: "courses",
                title: "Structurer les cours",
                description: "Organisez périodes, années et cours.",
                action: () => router.push("/courses"),
              },
              {
                key: "attendance",
                title: "Configurer les présences",
                description: "Générez votre première fiche.",
                action: () => router.push("/attendance"),
              },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  padding: spacing[4],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacing[4],
                }}
              >
                <div>
                  <div style={{ ...typography.h4, color: colors.text.primary }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      ...typography.bodySmall,
                      color: colors.text.secondary,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
                <div style={{ display: "flex", gap: spacing[2] }}>
                  <Button variant="primary" size="sm" onClick={item.action}>
                    Démarrer
                  </Button>
                  <Button
                    variant={onboarding[item.key] ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => updateOnboarding(item.key, !onboarding[item.key])}
                  >
                    {onboarding[item.key] ? "Terminé" : "Marquer terminé"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
