"use client";

import { useEffect, useState } from "react";
import { TreeItem } from "@mui/lab";
import { Checkbox, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import {
  collection,
  getDoc,
  onSnapshot,
  query,
  DocumentReference,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "@/firebase";
import { deleteCourses } from "@/firebaseFun";
import { StyledTreeItem, StyledTreeView } from "@/Components/StyledTreeView";
import CoursNewContent from "@/Components/CoursNewContent";
import CoursesToolBar from "@/Components/CoursesToolBar";
import FichePresenceNewContent from "@/Components/FichePresenceNewContent";

type CheckedItem = {
  period: string;
  annee: string;
  courdocId: string;
};

type CourseItem = {
  nomDuCour: string;
  courdocId: string;
  profDuCour: string;
  profCourId: string;
};

type StudentItem = {
  eleveId: string;
  prenom: string;
  nom: string;
};

export const CoursesList = () => {
  const [periodsData, setPeriodsData] = useState<string[]>([]);
  const [anneeData, setAnneeData] = useState<Record<string, string[]>>({});
  const [coursData, setCoursData] = useState<
    Record<string, Record<string, CourseItem[]>>
  >({});
  const [eleveData, setEleveData] = useState<Record<string, StudentItem[]>>({});
  const [open, setOpen] = useState(false);
  const [ficheOpen, setFicheOpen] = useState(false);
  const [checked, setChecked] = useState<CheckedItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchValueperiods, setSearchValuePeriods] = useState("");
  const router = useRouter();

  const handleToggle = (period: string, annee: string, courdocId: string) => () => {
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
    if (yesno) {
      checked.forEach(async (cour) => {
        await deleteCourses(cour.period, cour.annee, cour.courdocId);
      });
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFicheOpen = () => setFicheOpen(true);
  const handleFicheClose = () => setFicheOpen(false);

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
                        })
                      );

                      eleveUpdates[`${periodId}-${courId}`] = eleves.filter(
                        Boolean
                      ) as StudentItem[];

                      return {
                        nomDuCour: data.nomDuCour || courId,
                        courdocId: courId,
                        profDuCour,
                        profCourId,
                      } as CourseItem;
                    })
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
                }
              );

              unsubscribes.push(unsubscribeCours);
            });

            setAnneeData((prevAnneeData) => ({
              ...prevAnneeData,
              [periodId]: annees,
            }));
          }
        );

        unsubscribes.push(unsubscribeAnnees);
      });

      setPeriodsData(periods);
    });

    unsubscribes.push(unsubscribePeriods);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const handledoubleuserClick = (userid: string) => {
    router.push(`/students/${userid}`);
  };
  const handledoubleprofClick = (profId: string) => {
    router.push(`/professors/${profId}`);
  };

  const filteredPeriods = periodsData.filter((period) =>
    period.toLowerCase().includes(searchValueperiods.toLowerCase())
  );
  const filteredCours = (data: CourseItem[]) =>
    data.filter((cour) =>
      cour.nomDuCour.toLowerCase().includes(searchValue.toLowerCase())
    );

  return (
    <div className="p-7 bg-gray-50 w-full h-screen flex flex-col space-y-5 overflow-scroll">
      <CoursesToolBar
        searchValue={searchValue}
        searchValueperiods={searchValueperiods}
        setSearchValue={setSearchValue}
        setSearchValuePeriods={setSearchValuePeriods}
        handleDelete={handleDelete}
        handleOpen={handleOpen}
        handleFicheOpen={handleFicheOpen}
      />
      <div className="bg-white w-full h-full shadow-lg rounded-lg p-7 overflow-scroll">
        {filteredPeriods.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Aucun cours trouve. Essayez une autre recherche ou ajoutez un cours.
          </div>
        ) : (
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
                                nodeId={`${period} ${annees} ${cour.courdocId} ${eleveId}`}
                                label={`${prenom} ${nom} ➜`}
                                key={eleveId}
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
        )}
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
      <Dialog
        open={ficheOpen}
        onClose={handleFicheClose}
        maxWidth="xl"
        PaperProps={{
          style: {
            width: "900px",
            height: "700px",
          },
        }}
      >
        <DialogTitle>Creer une fiche de presence</DialogTitle>
        <DialogContent>
          <FichePresenceNewContent close={handleFicheClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
