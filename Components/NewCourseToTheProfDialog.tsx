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
import { addCoursToTheUser, addCourseToTheProffesor } from "@/firebaseFun";
import { useRouter } from "next/router";

type Props = {};

function NewCourseToTheProfDialog({ handleClose }) {
  const router = useRouter();
  const profId = router.query.id.toString();
  const [periodsData, setPeriodsData] = useState([]);
  const [anneeData, setAnneeData] = useState({});
  const [coursData, setCoursData] = useState({});
  const [checked, setChecked] = useState([]);

  const handleToggle = (period, annee, courdocId) => () => {
    const currentIndex = checked.findIndex(
      (item) =>
        item.period === period &&
        item.annee === annee &&
        item.courdocId === courdocId
    );
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push({ period, annee, courdocId });
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  const handleAdd = async () => {
    try {
      await checked.forEach((cour) => {
        addCourseToTheProffesor(
          profId,
          cour.annee,
          cour.period,
          cour.courdocId
        );
      });

      handleClose();
    } catch (e) {
      console.log(e);
    }
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
                coursDocs.forEach((courDoc) => {
                  const courId = courDoc.id;
                  const nomDuCour = courDoc.data().nomDuCour;
                  const profDuCour = courDoc.data().profDuCour;
                  cours.push({
                    nomDuCour: nomDuCour,
                    courdocId: courId,
                    profDuCourRef: profDuCour,
                  });
                });
                setCoursData((prevCoursData) => ({
                  ...prevCoursData,
                  [periodId]: {
                    ...prevCoursData[periodId],
                    [anneeId]: cours,
                  },
                }));
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
                              cour.courdocId
                            )}
                          />
                          {`${
                            cour.profDuCourRef
                              ? `${cour.nomDuCour}, !!!! deja donnee par un prof`
                              : `${cour.nomDuCour}, pas encore de prof`
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

export default NewCourseToTheProfDialog;
