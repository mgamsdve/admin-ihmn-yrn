import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
async function addUser(userData, userMDP, handleClose) {
  try {
    const newUser = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userMDP
    );

    await setDoc(doc(db, "users", newUser.user.uid), userData);
    handleClose();
    //console.log('Document written with ID: ', newUser.user.uid)
  } catch (e) {
    alert(`Invalid Email`);
  }
}

async function addProfessor(userData, userMDP, handleClose) {
  try {
    const newUser = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userMDP
    );

    await setDoc(doc(db, "profs", newUser.user.uid), userData);
    handleClose();
    //console.log('Document written with ID: ', newUser.user.uid)
  } catch (e) {
    alert(`Invalid Email`);
  }
}

async function updateUser(docId, newuserData) {
  try {
    const docRef = doc(db, "users", docId);
    await updateDoc(docRef, newuserData);
    //console.log('Document updated with ID: ', id)
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}
async function updateProfessor(docId, newuserData) {
  try {
    const docRef = doc(db, "profs", docId);
    await updateDoc(docRef, newuserData);
    //console.log('Document updated with ID: ', id)
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

async function deleteUser(uid) {
  const response = await fetch("/api/deleteUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(data.message);
  } else {
    console.log(data.error);
  }
}

const deleteDocuments = async (collectionName: string, docIds: string[]) => {
  const batch = writeBatch(db);

  docIds.forEach((docId) => {
    const docRef = doc(db, collectionName, docId);
    batch.delete(docRef);
    deleteUser(docId);
  });

  await batch.commit();
};

const addCoursToTheUser = async (
  userUId: string,
  anneeId: string,
  periodId: string,
  coursId: string
) => {
  const courRef = doc(
    db,
    "periods",
    periodId,
    "annees",
    anneeId,
    "cours",
    coursId
  );
  await setDoc(
    doc(db, "users", userUId, "periods", periodId),
    {
      annee: arrayUnion(anneeId),
    },
    {
      merge: true,
    }
  );
  await setDoc(
    doc(db, "users", userUId, "periods", periodId, "cours", coursId),
    {
      cour: courRef,
      anneeDuCour: anneeId,
    }
  );
  const userRef = doc(db, "users", userUId);
  await updateDoc(courRef, { eleves: arrayUnion(userRef) });
};

const addPeriodOnly = async (periodName) => {
  await setDoc(doc(db, "periods", periodName), {});
};

const addCourses = async (periods, annee, nomDuCour, profId?) => {
  const profDuCourDoc = profId ? doc(db, "profs", profId) : "";
  await setDoc(doc(db, "periods", periods, "annees", annee), {});

  if (profDuCourDoc === "") {
    await setDoc(
      doc(db, "periods", periods, "annees", annee, "cours", nomDuCour),
      {
        nomDuCour: nomDuCour,
      }
    );
  } else {
    await setDoc(
      doc(db, "periods", periods, "annees", annee, "cours", nomDuCour),
      {
        nomDuCour: nomDuCour,
        profDuCour: profDuCourDoc,
      }
    );

    const courRef = doc(
      db,
      "periods",
      periods,
      "annees",
      annee,
      "cours",
      nomDuCour
    );

    await setDoc(doc(db, "profs", profId, "periods", periods), {});
    await setDoc(
      doc(db, "profs", profId, "periods", periods, "annees", annee),
      {}
    );

    const courRefDuProfDuCour = doc(
      db,
      "profs",
      profId,
      "periods",
      periods,
      "annees",
      annee,
      "cours",
      nomDuCour
    );
    await setDoc(courRefDuProfDuCour, {
      cour: courRef,
    });
  }
};

const deleteCoursesToTheUser = async (userId, periodId, anneId, coursId) => {
  const courRealRef = doc(
    db,
    "periods",
    periodId,
    "annees",
    anneId,
    "cours",
    coursId
  );
  const userRef = doc(db, "users", userId);
  await updateDoc(courRealRef, {
    eleves: arrayRemove(userRef),
  });
  const docRef = doc(
    db,
    "users",
    userId,
    "periods",
    periodId,
    "cours",
    coursId
  );
  await deleteDoc(docRef);
};

const deleteCourses = async (periodId, anneeId, courId) => {
  const courRefInPeriod = doc(
    db,
    "periods",
    periodId,
    "annees",
    anneeId,
    "cours",
    courId
  );
  const elevesInCourses = [];

  const docSnap = await getDoc(courRefInPeriod);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const elevesRefs = data.eleves;
    if (elevesRefs && elevesRefs.length > 0) {
      const elevesQuery = query(
        collection(db, "users"),
        where("__name__", "in", elevesRefs)
      );
      const elevesSnap = await getDocs(elevesQuery);

      elevesSnap.forEach((doc) => {
        elevesInCourses.push(doc.id);
      });
    }

    const profDuCour = data.profDuCour;
    if (profDuCour === "") {
    } else {
      const courDocInProfPeriods = doc(
        profDuCour,
        "periods",
        periodId,
        "annees",
        anneeId,
        "cours",
        courId
      );
      await deleteDoc(courDocInProfPeriods);
    }
  } else {
    console.log("No such document!");
  }

  elevesInCourses.forEach(async (eleveId) => {
    //console.log(eleveId)
    const courForTheEleves = doc(
      db,
      "users",
      eleveId,
      "periods",
      periodId,
      "cours",
      courId
    );
    await deleteDoc(courForTheEleves);
  });

  await deleteDoc(courRefInPeriod);
};

const addCourseToTheProffesor = async (
  profUId: string,
  anneeId: string,
  periodId: string,
  coursId: string
) => {
  const courRef = doc(
    db,
    "periods",
    periodId,
    "annees",
    anneeId,
    "cours",
    coursId
  );
  await setDoc(doc(db, "profs", profUId, "periods", periodId), {});
  await setDoc(
    doc(db, "profs", profUId, "periods", periodId, "annees", anneeId),
    {}
  );
  await setDoc(
    doc(
      db,
      "profs",
      profUId,
      "periods",
      periodId,
      "annees",
      anneeId,
      "cours",
      coursId
    ),
    {
      cour: courRef,
    }
  );
  await updateDoc(courRef, {
    profDuCour: doc(db, "profs", profUId),
  });
};

const deleteCourseToTheProfessor = async (
  profId,
  periodId,
  anneId,
  coursId
) => {
  // console.log(profId, periodId, anneId, coursId);
  const profref = doc(
    db,
    "profs",
    profId,
    "periods",
    periodId,
    "annees",
    anneId,
    "cours",
    coursId
  );
  if (db) {
    await deleteDoc(profref);
    await updateDoc(
      doc(db, "periods", periodId, "annees", anneId, "cours", coursId),
      {
        profDuCour: deleteField(),
      }
    );
  }
};

export {
  updateUser,
  updateProfessor,
  deleteDocuments,
  addCoursToTheUser,
  addPeriodOnly,
  addCourses,
  deleteCoursesToTheUser,
  deleteCourseToTheProfessor,
  addProfessor,
  deleteCourses,
  addCourseToTheProffesor,
};
export default addUser;
