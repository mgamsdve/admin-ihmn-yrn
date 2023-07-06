import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import SelectCoursesDalogForFichePresence from "./SelectCoursesDialogForFichePresence";
type Props = {};

function FichePresenceNewContent({close}) {
  const [periods, setPeriods] = useState("");
  const [annee, setAnnee] = useState("");

  const [cour, setCour] = useState("");
  const [prof, setProf] = useState("");
  const [date, setDate] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpenNew = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const addInfo = ({ NomDuCour, NomDuProf, AnneeDuCour, PeriodsDuCours }) => {
    setCour(NomDuCour);
    setProf(NomDuProf);
    setAnnee(AnneeDuCour);
    setPeriods(PeriodsDuCours);
  };

  const handleCreateFiche = () => {};
  return (
    <>
      <div className="p-5">
        <div className="flex flex-row space-x-10">
          <div className="flex flex-col space-y-5">
            <div className="flex flex-col">
              <h2>Periode du cour :</h2>
              <input
                value={periods}
                onChange={(e) => setPeriods(e.target.value)}
                className="input-detail"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <h2>Annee du cour :</h2>
              <input
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
                className="input-detail"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <h2>Nom du cour :</h2>
              <input
                value={cour}
                onChange={(e) => setCour(e.target.value)}
                className="input-detail"
                type="text"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-5">
            <div className="flex flex-col">
              <h2>Prof du cour :</h2>
              <input
                value={prof}
                onChange={(e) => setProf(e.target.value)}
                className="input-detail"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <h2>Date du cour :</h2>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-detail"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <button
                onClick={handleOpenNew}
                className="bg-blue-500 text-white mt-6 p-2 rounded-sm"
              >
                Selectionner un cours (OPT)
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row space-x-3 mt-10">
          <button
            onClick={handleCreateFiche}
            className="bg-green-100 text-green-500 hover:bg-green-50 duration-300 p-3 rounded-md"
          >
            Creer la fiche de presence (PDF)
          </button>
          <button
            onClick={close}
            className="bg-red-100 text-red-500 hover:bg-red-50 duration-300 p-3 rounded-md"
          >
            Annuler
          </button>
        </div>
      </div>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="xl"
          PaperProps={{
            style: {
              width: "1000px",
              height: "900px",
            },
          }}
        >
          <DialogTitle>
            Selectionner un cours pour la fiche de presence
          </DialogTitle>
          <DialogContent>
            <SelectCoursesDalogForFichePresence
              handleClose={handleClose}
              addInfo={addInfo}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default FichePresenceNewContent;
