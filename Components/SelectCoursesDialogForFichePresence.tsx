import React from "react";
import { TreeView, TreeItem } from "@mui/lab";
import { db } from "../firebase"; // importer l'instance de la base de données Firestore
import { useState, useEffect } from "react";
import {
  collection,
  collectionGroup,
  query,
  getDocs,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { StyledTreeItem, StyledTreeView } from "@/Components/StyledTreeView";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { Checkbox } from "@mui/material";

type Props = {};

function SelectCoursesDalogForFichePresence({ handleClose, addInfo }) {
  const [periodsData, setPeriodsData] = useState([]);
  const [anneeData, setAnneeData] = useState({});
  const [coursData, setCoursData] = useState({});
  const [checked, setChecked] = useState([]);

  const handleToggle = (period, annee, courdocId, prof) => () => {
    const currentIndex = checked.findIndex(
      (item) =>
        item.period === period &&
        item.annee === annee &&
        item.courdocId === courdocId
    );
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push({ period, annee, courdocId, prof });
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  const handleAdd = async () => {
    checked.map((chek) => {
      const nom = chek.courdocId;
      const prof = chek.prof;
      const annee = chek.annee;
      const period = chek.period;
      addInfo({
        NomDuCour: nom,
        NomDuProf: prof,
        AnneeDuCour: annee,
        PeriodsDuCours: period,
      });
    });

    handleClose();
  };
  const cancel = () => {
    handleClose();
  };

  useEffect(() => {
    const periodsdocsquery = query(collection(db, "periods"));
    getDocs(periodsdocsquery).then((periodDocs) => {
      const periods = [];
      periodDocs.forEach((periodDoc) => {
        const periodId = periodDoc.id;
        periods.push(periodId);
        getDocs(query(collection(db, "periods", periodId, "annees"))).then(
          (anneesDocs) => {
            const annees = [];
            anneesDocs.forEach((anneeDoc) => {
              const anneeId = anneeDoc.id;
              annees.push(anneeId);
              getDocs(
                query(
                  collection(
                    db,
                    "periods",
                    periodId,
                    "annees",
                    anneeId,
                    "cours"
                  )
                )
              ).then((coursDocs) => {
                const cours = [];
                const promises = [];

                coursDocs.forEach((courDoc) => {
                  const courId = courDoc.id;
                  const nomDuCour = courDoc.data().nomDuCour;
                  const profsref = courDoc.data().profDuCour;
                  if (profsref) {
                    promises.push(
                      getDoc(profsref).then((profData) => {
                        if (profData.exists()) {
                          const datatta: any = profData.data();
                          const profName = datatta.name;
                          const profPrename = datatta.prename;
                          const PN = `${profName} ${profPrename}`;
                          const profId = profData.id;
                          cours.push({
                            nomDuCour: nomDuCour,
                            courdocId: courId,
                            profDuCour: PN,
                            profCourId: profId,
                          });
                        }
                      })
                    );
                  } else {
                    cours.push({
                      nomDuCour: nomDuCour,
                      courdocId: courId,
                      profDuCour: "",
                      profCourId: "",
                    });
                  }
                });
                Promise.all(promises).then(() => {
                  setCoursData((prevCoursData) => ({
                    ...prevCoursData,
                    [periodId]: {
                      ...prevCoursData[periodId],
                      [anneeId]: cours,
                    },
                  }));
                });
              });
            });
            setAnneeData((prevAnneeData) => ({
              ...prevAnneeData,
              [periodId]: annees,
            }));
          }
        );
      });
      setPeriodsData(periods);
    });
  }, []);

  return (
    <div>
      <button
        onClick={handleAdd}
        className="bg-green-50 hover:text-green-500 hover:bg-green-100 duration-500 p-2 rounded-md text-green-400 font-semibold"
      >
        Ajouter les cours selectionnees
      </button>
      <button
        onClick={cancel}
        className="bg-red-50 hover:text-red-500 hover:bg-red-100 duration-500 p-2 rounded-md text-red-400 font-semibold"
      >
        Annuler
      </button>

      <div className="w-full h-[770px] shadow-xl rounded-md mt-4 p-4">
        <StyledTreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
        >
          {periodsData.map((period) => (
            <StyledTreeItem
              nodeId={period}
              label={period}
              key={period}
              $cours={true}
            >
              {(anneeData[period] || []).map((annee) => (
                <StyledTreeItem
                  nodeId={`${period}-${annee}`}
                  label={annee}
                  $annee={true}
                  key={annee}
                >
                  {(coursData[period]?.[annee] || []).map((cour) => (
                    <TreeItem
                      nodeId={`${period}-${annee}-${cour.courdocId}`}
                      label={
                        <div>
                          <Checkbox
                            checked={
                              checked.findIndex(
                                (item) =>
                                  item.period === period &&
                                  item.annee === annee &&
                                  item.courdocId === cour.courdocId
                              ) !== -1
                            }
                            onChange={handleToggle(
                              period,
                              annee,
                              cour.courdocId,
                              cour.profDuCour
                            )}
                          />
                          {`${cour.nomDuCour} ${
                            cour.profDuCour === ""
                              ? ""
                              : `, par ${cour.profDuCour}`
                          }`}
                        </div>
                      }
                      key={cour.courdocId}
                    />
                  ))}
                </StyledTreeItem>
              ))}
            </StyledTreeItem>
          ))}
        </StyledTreeView>
      </div>
    </div>
  );
}

export default SelectCoursesDalogForFichePresence;
