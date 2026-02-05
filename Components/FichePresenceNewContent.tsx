import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import createXLSX from "@/FicheExcel";
import SelectCoursesDalogForFichePresence from "./SelectCoursesDialogForFichePresence";
import { designSystem } from "@/src/lib/design-system";
import { Input } from "@/src/components/ui/Input";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";

interface FichePresenceProps {
  close: () => void;
}

function FichePresenceNewContent({ close }: FichePresenceProps) {
  const [periods, setPeriods] = useState("");
  const [annee, setAnnee] = useState("");
  const [cour, setCour] = useState("");
  const [prof, setProf] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenNew = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addInfo = ({ NomDuCour, NomDuProf, AnneeDuCour, PeriodsDuCours }) => {
    setCour(NomDuCour);
    setProf(NomDuProf);
    setAnnee(AnneeDuCour);
    setPeriods(PeriodsDuCours);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!cour) nextErrors.cour = "Cours requis";
    if (!periods) nextErrors.periods = "Période requise";
    if (!annee) nextErrors.annee = "Année requise";
    if (!date) nextErrors.date = "Date requise";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateFiche = () => {
    if (!validate()) return;

    getDoc(doc(db, "periods", periods, "annees", annee, "cours", cour)).then(
      (docs) => {
        const studrefs = docs.data().eleves || [];
        const students: string[] = [];

        Promise.all(
          studrefs.map((studref) => {
            return getDoc(studref).then((studdoc) => {
              const data: any = studdoc.data();
              const name = data.name || "";
              const prename = data.prename || "";
              const np = `${prename} ${name}`.trim();
              if (np) students.push(np);
            });
          })
        ).then(() => {
          createXLSX(students, prof, cour, date);
        });
      }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.lg }}>
      <div>
        <div
          style={{
            ...designSystem.typography.h4,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing.xs,
          }}
        >
          Créer une fiche de présence
        </div>
        <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
          Sélectionnez un cours et une date pour générer un fichier Excel.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: designSystem.spacing.md,
        }}
      >
        <Input
          label="Période"
          value={periods}
          onChange={(e) => {
            setPeriods(e.target.value);
            if (errors.periods) setErrors({ ...errors, periods: "" });
          }}
          error={errors.periods}
          placeholder="ex: 2024-2025"
        />
        <Input
          label="Année"
          value={annee}
          onChange={(e) => {
            setAnnee(e.target.value);
            if (errors.annee) setErrors({ ...errors, annee: "" });
          }}
          error={errors.annee}
          placeholder="ex: 1 ere année jour"
        />
        <Input
          label="Cours"
          value={cour}
          onChange={(e) => {
            setCour(e.target.value);
            if (errors.cour) setErrors({ ...errors, cour: "" });
          }}
          error={errors.cour}
          placeholder="Nom du cours"
        />
        <Input
          label="Professeur"
          value={prof}
          onChange={(e) => setProf(e.target.value)}
          placeholder="Nom du professeur"
        />
        <DatePicker
          label="Date du cours"
          value={date}
          onChange={(value) => {
            setDate(value);
            if (errors.date) setErrors({ ...errors, date: "" });
          }}
          error={errors.date}
        />
      </div>

      <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
        <Button variant="secondary" onClick={handleOpenNew}>
          Sélectionner un cours
        </Button>
        <Button variant="primary" onClick={handleCreateFiche}>
          Créer la fiche (XLSX)
        </Button>
        <Button variant="ghost" onClick={close}>
          Annuler
        </Button>
      </div>

      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Sélectionner un cours"
        size="lg"
      >
        <SelectCoursesDalogForFichePresence
          handleClose={handleClose}
          addInfo={addInfo}
        />
      </Modal>
    </div>
  );
}

export default FichePresenceNewContent;
