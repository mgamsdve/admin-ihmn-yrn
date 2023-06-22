import { TreeView, TreeItem } from "@mui/lab";
import { db } from "../firebase"; // importer l'instance de la base de données Firestore
import { useState, useEffect } from "react";
import {
  collection,
  collectionGroup,
  query,
  getDocs,
  doc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { deleteCourses } from "@/firebaseFun";
import { StyledTreeItem, StyledTreeView } from "@/Components/StyledTreeView";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { useRouter } from "next/router";
import { Checkbox, Dialog, DialogContent, DialogTitle } from "@mui/material";
import CoursNewContent from "@/Components/CoursNewContent";

export default function MyTreeView() {
  const [periodsData, setPeriodsData] = useState([]);
  const [anneeData, setAnneeData] = useState({});
  const [coursData, setCoursData] = useState({});
  const [eleveData, setEleveData] = useState({});
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [checked, setChecked] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchValueperiods, setSearchValuePeriods] = useState("");

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

  const handleDelete = () => {
    const yesno = confirm(
      "Etes vous sur de vouloir supprimer le cour ? Attention, tout les eleves qui ont ce cour ne vont plus l'avoir !!!"
    );
    if (yesno == true) {
      checked.forEach(async (cour) => {
        await deleteCourses(cour.period, cour.annee, cour.courdocId);
      });
    }
  };

  useEffect(() => {
    const periodsdocsquery = query(collection(db, "periods"));
    onSnapshot(periodsdocsquery, (periodsdocs) => {
      const periods = [];
      periodsdocs.forEach((perioddoc) => {
        const periodId = perioddoc.id;
        periods.push(periodId);
        onSnapshot(
          query(collection(db, "periods", periodId, "annees")),
          (anneesSnapshot) => {
            const annees = [];
            anneesSnapshot.forEach((anneeDoc) => {
              const anneeId = anneeDoc.id;
              annees.push(anneeId);
              onSnapshot(
                query(
                  collection(
                    db,
                    "periods",
                    periodId,
                    "annees",
                    anneeId,
                    "cours"
                  )
                ),
                (coursSnapshot) => {
                  const cours = [];
                  const promises = [];
                  coursSnapshot.forEach((courDoc) => {
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
                    const eleves = courDoc.data().eleves || [];
                    eleves.forEach((eleveRef) => {
                      promises.push(
                        getDoc(eleveRef).then((eleveDoc: any) => {
                          try {
                            const eleveId = eleveDoc.id;
                            const prenom = eleveDoc.data().prename;
                            const nom = eleveDoc.data().name;
                            setEleveData((prevEleveData) => {
                              if (
                                prevEleveData[`${periodId}-${courId}`]?.some(
                                  (eleve) => eleve.eleveId === eleveId
                                )
                              ) {
                                return prevEleveData;
                              }
                              return {
                                ...prevEleveData,
                                [`${periodId}-${courId}`]: [
                                  ...(prevEleveData[`${periodId}-${courId}`] ||
                                    []),
                                  { eleveId, prenom, nom },
                                ],
                              };
                            });
                          } catch (e) {
                            console.log("e");
                          }
                        })
                      );
                    });
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
                }
              );
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

  const handledoubleuserClick = (userid) => {
    router.push(`/users/${userid}/UserDetail`);
  };
  const handledoubleprofClick = (profId) => {
    router.push(`/users/${profId}/ProfDetail`);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const filteredPeriods = periodsData.filter((period) =>
    period.toLowerCase().includes(searchValueperiods.toLowerCase())
  );
  const filteredCours = (data) =>
    data.filter((cour) =>
      cour.nomDuCour.toLowerCase().includes(searchValue.toLowerCase())
    );
  return (
    <div className="p-7 bg-gray-50 w-full h-screen flex flex-col space-y-5 overflow-scroll">
      <div className="bg-white w-full h-40 md:h-20 shadow-md rounded-lg p-7 flex flex-col md:flex-row space-y-3 md:space-x-5 md:space-y-0">
        <input
          placeholder="Rechercher dans les cours"
          className=" md:w-fit p-2 bg-gray-50 rounded-md"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
        />
        <input
          placeholder="Periods"
          className=" md:w-20 bg-gray-50 p-2 rounded-md"
          value={searchValueperiods}
          onChange={(e) => {
            setSearchValuePeriods(e.target.value);
          }}
        />
        <button
          onClick={handleOpen}
          className="text-green-600 hover:bg-green-50 rounded-md px-2 duration-300"
        >
          Ajouter un cour
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:bg-red-50 rounded-md px-2 duration-300"
        >
          Supprimer des cours
        </button>
      </div>
      <div className="bg-white w-full h-full shadow-lg rounded-lg p-7 overflow-scroll">
        <StyledTreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
        >
          {filteredPeriods.map((period) => (
            <StyledTreeItem
              nodeId={period}
              label={period}
              key={period}
              // @ts-ignore: suppress implicit any errors
              $cours={true}
            >
              {(anneeData[period] || []).map((annees) => (
                <StyledTreeItem
                  nodeId={`${period}-${annees}`}
                  label={annees}
                  // @ts-ignore: suppress implicit any errors
                  $annee={true}
                  key={annees}
                >
                  {filteredCours(coursData[period]?.[annees] || []).map(
                    (cour) => (
                      <TreeItem
                        nodeId={`${period}-${annees}-${cour.courdocId}`}
                        label={
                          <div>
                            <Checkbox
                              checked={
                                checked.findIndex(
                                  (item) =>
                                    item.period === period &&
                                    item.annee === annees &&
                                    item.courdocId === cour.courdocId
                                ) !== -1
                              }
                              onChange={handleToggle(
                                period,
                                annees,
                                cour.courdocId
                              )}
                            />
                            {`${cour.nomDuCour} ${
                              cour.profDuCour === ""
                                ? ""
                                : `, par ${cour.profDuCour} ➜`
                            }`}
                          </div>
                        }
                        key={cour.courdocId}
                        onClick={(e) => {
                          if (e.shiftKey) {
                            if (cour.profDuCour) {
                              handledoubleprofClick(cour.profCourId);
                            }
                          }
                        }}
                      >
                        {(eleveData[`${period}-${cour.courdocId}`] || []).map(
                          ({ eleveId, prenom, nom }) => (
                            <TreeItem
                              nodeId={`${period} ${annees} ${cour.courdocId} ${eleveId} `}
                              label={`${prenom} ${nom} ➜`}
                              key={prenom}
                              onDoubleClick={() =>
                                handledoubleuserClick(eleveId)
                              }
                            />
                          )
                        )}
                      </TreeItem>
                    )
                  )}
                </StyledTreeItem>
              ))}
            </StyledTreeItem>
          ))}
        </StyledTreeView>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        PaperProps={{
          style: {
            width: "400px",
            height: "700px",
          },
        }}
      >
        <DialogTitle>Ajouter un Cour</DialogTitle>
        <DialogContent>
          <CoursNewContent handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
