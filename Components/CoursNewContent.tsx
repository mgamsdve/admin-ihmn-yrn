import { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { addPeriodOnly, addCourses } from "@/firebaseFun";
import { designSystem } from "@/src/lib/design-system";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";

interface CourseFormProps {
  handleClose: () => void;
}

export default function CoursNewContent({ handleClose }: CourseFormProps) {
  const [periodsSelected, setPeriodsSelected] = useState("");
  const [periods, setPeriods] = useState<string[]>([]);
  const [profs, setProfs] = useState<Array<{ nomDuProf: string; docId: string }>>([]);
  const [entry, setEntry] = useState(false);
  const [periodName, setPeriodName] = useState("");
  const [anneeSelected, setAnneeSelected] = useState("");
  const [profSelected, setProfSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [nomDuCour, setNomDuCour] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const annees = [
    "1 ere année jour",
    "2 eme années jour",
    "3 eme années jour",
    "4 eme années jour",
    "1 ere année soir",
    "2 eme années soir",
    "3 eme années soir",
    "4 eme années soir",
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "periods")), (periodDocs) => {
      const periodIds = periodDocs.docs.map((doc) => doc.id);
      setPeriods(periodIds);
    });

    getDocs(query(collection(db, "profs"))).then((profDoc) => {
      const profsList: Array<{ nomDuProf: string; docId: string }> = [];
      profDoc.forEach((docs) => {
        const profName = `${docs.data().name || ""} ${docs.data().prename || ""}`.trim();
        const profId = docs.id;
        profsList.push({ nomDuProf: profName || "Professeur", docId: profId });
      });
      setProfs(profsList);
    });

    return () => unsubscribe();
  }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!periodsSelected) nextErrors.period = "Période requise";
    if (!anneeSelected) nextErrors.annee = "Année requise";
    if (!nomDuCour) nextErrors.nomDuCour = "Nom du cours requis";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreatePeriod = async () => {
    if (!periodName.trim()) {
      setErrors({ periodName: "Nom de période requis" });
      return;
    }
    await addPeriodOnly(periodName.trim());
    setPeriodsSelected(periodName.trim());
    setPeriodName("");
    setEntry(false);
    setErrors({});
  };

  const handleAddCourse = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const profId = profSelected || undefined;

      if (checked) {
        const yearMap = [
          {
            key: "1",
            day: "1 ere année jour",
            night: "1 ere année soir",
          },
          {
            key: "2",
            day: "2 eme années jour",
            night: "2 eme années soir",
          },
          {
            key: "3",
            day: "3 eme années jour",
            night: "3 eme années soir",
          },
          {
            key: "4",
            day: "4 eme années jour",
            night: "4 eme années soir",
          },
        ];

        yearMap.forEach((year) => {
          if (anneeSelected.includes(year.key)) {
            addCourses(periodsSelected, year.day, `${nomDuCour} jour`, profId);
            addCourses(periodsSelected, year.night, `${nomDuCour} soir`, profId);
          }
        });
      } else {
        await addCourses(periodsSelected, anneeSelected, nomDuCour, profId);
      }

      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
      <div>
        <div
          style={{
            ...designSystem.typography.h4,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing.xs,
          }}
        >
          Créer un cours
        </div>
        <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
          Renseignez la période, l'année et le nom du cours. L'attribution du professeur est optionnelle.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: designSystem.spacing.md,
          alignItems: "end",
        }}
      >
        {!entry ? (
          <Select
            label="Période"
            value={periodsSelected}
            onChange={(value) => {
              setPeriodsSelected(value);
              if (errors.period) setErrors({ ...errors, period: "" });
            }}
            placeholder="Choisir une période"
            options={periods.map((period) => ({ value: period, label: period }))}
            error={errors.period}
          />
        ) : (
          <Input
            label="Nouvelle période"
            value={periodName}
            onChange={(e) => {
              setPeriodName(e.target.value);
              if (errors.periodName) setErrors({ ...errors, periodName: "" });
            }}
            error={errors.periodName}
            placeholder="ex: 2024-2025"
          />
        )}

        {!entry ? (
          <Button variant="ghost" onClick={() => setEntry(true)}>
            + Ajouter une période
          </Button>
        ) : (
          <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
            <Button variant="primary" onClick={handleCreatePeriod}>
              Créer la période
            </Button>
            <Button variant="ghost" onClick={() => setEntry(false)}>
              Annuler
            </Button>
          </div>
        )}
      </div>

      {!entry && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: designSystem.spacing.md }}>
          <Select
            label="Année"
            value={anneeSelected}
            onChange={(value) => {
              setAnneeSelected(value);
              if (errors.annee) setErrors({ ...errors, annee: "" });
            }}
            placeholder="Choisir une année"
            options={annees.map((annee) => ({ value: annee, label: annee }))}
            error={errors.annee}
          />

          <Input
            label="Nom du cours"
            value={nomDuCour}
            onChange={(e) => {
              setNomDuCour(e.target.value);
              if (errors.nomDuCour) setErrors({ ...errors, nomDuCour: "" });
            }}
            error={errors.nomDuCour}
            placeholder="ex: Mathématiques"
          />

          <Select
            label="Professeur (optionnel)"
            value={profSelected}
            onChange={setProfSelected}
            placeholder="Aucun"
            options={profs.map((prof) => ({ value: prof.docId, label: prof.nomDuProf }))}
          />

          <div style={{ display: "flex", alignItems: "center", marginTop: designSystem.spacing.md }}>
            <Checkbox
              checked={checked}
              onChange={setChecked}
              label="Créer en version jour et soir"
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: designSystem.spacing.sm }}>
        <Button variant="ghost" onClick={handleClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleAddCourse} loading={loading}>
          Ajouter le cours
        </Button>
      </div>
    </div>
  );
}
