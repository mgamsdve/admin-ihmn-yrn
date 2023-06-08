import { useState, useEffect } from "react";
import { collection, onSnapshot, getDoc, query } from "firebase/firestore";
import { TreeView, TreeItem } from "@mui/lab";
import { deleteCoursesToTheUser } from "@/firebaseFun";
import { db } from "../firebase";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { StyledTreeItem, StyledTreeView } from "./StyledTreeView";
import NewCourseToTheUserDialog from "./NewCourseToTheUserDialog";

type Props = {};

function UserCourses({}: Props) {
  const router = useRouter();
  const userId = router.query.id.toString();
  const [periods, setPeriods] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "users", userId, "periods")),
      (snapshot) => {
        const periodsData = [];
        snapshot.forEach((doc) => {
          const period = {
            id: doc.id,
            annee: doc.data().annee,
            cours: [], // Initialize an empty array for storing cours documents
          };
          periodsData.push(period);

          // Fetch cours documents for the current period
          onSnapshot(
            query(collection(db, "users", userId, "periods", doc.id, "cours")),
            (coursSnapshot) => {
              const coursData = [];
              coursSnapshot.forEach(async (coursDoc) => {
                const coursRef = coursDoc.data().cour;
                const referencedCoursDoc: any = await getDoc(coursRef);
                coursData.push({
                  id: referencedCoursDoc.id,
                  anneeDuCour: coursDoc.data().anneeDuCour,
                  nomDuCour: referencedCoursDoc.data().nomDuCour,
                  // Add other cours fields here
                });
                // Update the cours array for the current period
                period.cours = coursData;
                setPeriods([...periodsData]); // Update the periods state with the modified array
              });
            }
          );
        });
        setPeriods(periodsData);
      }
    );

    return () => unsubscribe();
  }, []);

  const [checked, setChecked] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPeriods = periods.filter(
    (period) =>
      period.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      period.annee.some((anne) =>
        anne.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      period.cours.some((cours) =>
        cours.nomDuCour.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = (period, annee, courdocId, courAnne) => () => {
    const currentIndex = checked.findIndex(
      (item) =>
        item.period === period &&
        item.annee === annee &&
        item.courdocId === courdocId
    );
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push({ period, annee, courdocId, courAnne });
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleDelete = async () => {
    const yesno = confirm(
      "Ete vous sur de vouloir supprimer ces cours a l'eleve ?"
    );
    if (yesno == true) {
      checked.forEach((courCheck) => {
        const uid = userId;
        const periodId = courCheck.period;
        const anneeId = courCheck.courAnne;
        const courId = courCheck.courdocId;
        //console.log(periodId, anneeId, courId)
        deleteCoursesToTheUser(uid, periodId, anneeId, courId);
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
            placeholder="Rechercher"
            className="p-2 md:w-fit bg-gray-50 rounded-md"
            value={searchTerm}
            onChange={handleSearchChange}
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
                $cours
                key={period.id}
                nodeId={period.id}
                label={<div>{` ${period.id} - ${period.annee}`}</div>}
              >
                {period.cours.map((cours) => (
                  <StyledTreeItem
                    $annee
                    key={cours.id}
                    nodeId={cours.id}
                    label={
                      <div>
                        <Checkbox
                          checked={
                            checked.findIndex(
                              (item) =>
                                item.period === period.id &&
                                item.annee === period.annee &&
                                item.courdocId === cours.id
                            ) !== -1
                          }
                          onChange={handleToggle(
                            period.id,
                            period.annee,
                            cours.id,
                            cours.anneeDuCour
                          )}
                        />
                        {`${cours.nomDuCour}`}
                      </div>
                    }
                  >
                    {/* Render other course details here */}
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
        <DialogTitle>Ajouter des cours</DialogTitle>
        <DialogContent>
          <NewCourseToTheUserDialog handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserCourses;
