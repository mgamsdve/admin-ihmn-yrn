import { Checkbox, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { StyledTreeItem, StyledTreeView } from "./StyledTreeView";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { collection, getDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/router";
import { TreeItem } from "@mui/lab";
import NewCourseToTheProfDialog from "./NewCourseToTheProfDialog";
import { deleteCourseToTheProfessor } from "@/firebaseFun";

type Props = {};

function ProfCourses({}: Props) {
  const [open, SetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchValueperiods, setSearchValuePeriods] = useState("");
  const router = useRouter();
  const profId = router.query.id.toString();
  const [periodsData, setPeriodsData] = useState([]);
  const [anneeData, setAnneeData] = useState({});
  const [coursData, setCoursData] = useState({});
  const [checked, setChecked] = useState([]);

  //
  //

  useEffect(() => {
    const periodsdocsquery = query(collection(db, "periods"));
    onSnapshot(periodsdocsquery, (periodsdocs) => {
      const periods = [];
      periodsdocs.forEach((perioddoc) => {
        const periodId = perioddoc.id;
        periods.push(periodId);
        onSnapshot(
          query(collection(db, "profs", profId, "periods", periodId, "annees")),
          (anneesSnapshot) => {
            const annees = [];
            anneesSnapshot.forEach((anneeDoc) => {
              const anneeId = anneeDoc.id;
              annees.push(anneeId);
              onSnapshot(
                query(
                  collection(
                    db,
                    "profs",
                    profId,
                    "periods",
                    periodId,
                    "annees",
                    anneeId,
                    "cours"
                  )
                ),
                (coursSnapshot) => {
                  const promises = coursSnapshot.docs.map((courDoc) => {
                    const courId = courDoc.id;
                    const courRef = courDoc.data().cour;
                    return getDoc(courRef).then((referencedDoc) => {
                      const ddadada: any = referencedDoc.data();
                      const nomDuCour = ddadada.nomDuCour;
                      return {
                        nomDuCour: nomDuCour,
                        courdocId: courId,
                      };
                    });
                  });
                  Promise.all(promises).then((cours) => {
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

  const handleOpen = () => {
    SetOpen(true);
  };
  const handleClose = () => {
    SetOpen(false);
  };

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

  const filteredPeriods = periodsData.filter((period) =>
    period.toLowerCase().includes(searchValueperiods.toLowerCase())
  );
  const filteredCours = (data) =>
    data.filter((cour) =>
      cour.nomDuCour.toLowerCase().includes(searchValue.toLowerCase())
    );

  const handleDelete = async () => {
    const yesno = confirm(
      "Ete vous sur de vouloir supprimer ces cours au proffeseur ?"
    );
    if (yesno == true) {
      checked.forEach((courCheck) => {
        const uid = profId;
        const periodId = courCheck.period;
        const anneeId = courCheck.annee;
        const courId = courCheck.courdocId;
        //console.log(periodId, anneeId, courId)
        deleteCourseToTheProfessor(uid, periodId, anneeId, courId);
      });
      alert(
        "Cour Supprimer !, Si c'est le dernier, il est possible qu'il reste afficher, mais si vous rafraichisser, il ne sera plus la !"
      );
    } else {
      alert("Aucun cour n'a ete supprimer");
    }
  };
  return (
    <>
      <div className="shadow-lg rounded-lg p-7 w-full h-[850px] bg-white">
        <div className="flex md:flex-row flex-col border-b rounded-md md:w-full p-5 space-x-5">
          <input
            placeholder="Rechercher dans les cours"
            className="p-2 md:w-fit bg-gray-50 rounded-md"
            value={searchValue}
            onChange={(ev) => setSearchValue(ev.target.value)}
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
            className="text-green-600 hover:bg-green-50 rounded-sm p-2 duration-300"
            onClick={handleOpen}
          >
            Ajouter des cours
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50 rounded-sm p-2 duration-300"
          >
            Supprimer des cours
          </button>
        </div>
        <div className="p-5 overflow-scroll">
          <StyledTreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
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
                              {`${cour.nomDuCour} `}
                            </div>
                          }
                          key={cour.courdocId}
                          //onDoubleClick={() =>
                          //  // handledoubleprofClick(cour.profCourId)
                          // }
                        ></TreeItem>
                      )
                    )}
                  </StyledTreeItem>
                ))}
              </StyledTreeItem>
            ))}
          </StyledTreeView>
        </div>
      </div>
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
        <DialogTitle>Ajouter des cours a l'enseignant</DialogTitle>
        <DialogContent>
          <NewCourseToTheProfDialog handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProfCourses;
