import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { updateProfessor, deleteDocuments } from "@/firebaseFun";
import { BsTrash } from "react-icons/bs";
import Image from "next/image";

function ProfInformation() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userid, setUserid] = useState([""]);
  const [prename, setPrename] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [dateDeNaissance, setDateDeNaissance] = useState("");

  useEffect(() => {
    const userId = router.query.id.toString();
    const userRef = doc(db, "profs", userId);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUser(docSnap.data());
        setPrename(docSnap.data().prename);
        setName(docSnap.data().name);
        setDateDeNaissance(docSnap.data().dateDeNaissance);
        setPhone(docSnap.data().phone);
        setEmail(docSnap.data().email);
        setAdresse(docSnap.data().adresse);
        setUserid([userId]);
        if (!docSnap.data().profilePic) {
          setProfilePic(
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          );
        } else {
          setProfilePic(docSnap.data().profilePic);
        }
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [router.query.id]);

  if (!user) {
    return <div>Loading...</div>;
  }
  async function handleUpdate() {
    try {
      const profId = router.query.id.toString();
      const newDocData = {
        prename: prename,
        name: name,
        dateDeNaissance: dateDeNaissance,
        phone: phone,
        email: email,
        adresse: adresse,
      };
      await updateProfessor(profId, newDocData);
      alert("Modification réussie");
    } catch (error) {
      alert(`Une erreur est survenue ${error}`);
    }
  }

  async function handleDeleteUsers(e) {
    if (confirm("Voulez-vous vraiment supprimer ces utilisateurs ?")) {
      await deleteDocuments("users", userid);
      alert("Les utilisateurs ont été supprimés");
      router.push("/StudentPages");
    } else {
      alert("Rien n'a été supprimé");
    }
  }
  return (
    <div>
      <button
        className="text-3xl font-bold absolute p-5  text-red-600 hover:text-red-950 duration-300 "
        onClick={handleDeleteUsers}
      >
        <BsTrash />
      </button>
      <div className="flex flex-col bg-white h-[850px] rounded-xl">
        <div className="flex flex-col mt-14 sm:min-w-[420px] w-fit space-y-3 shadow-lg p-7 h-[850px]  rounded-md">
          <div className="flex justify-center">
            <Image
              width={210}
              height={210}
              src={profilePic}
              alt="Profile Pic"
              className="flex rounded-full w-52 h-52"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-500">
            Information - PROF
          </h1>

          <div className="flex flex-row space-x-2">
            <div className="flex flex-col">
              <h2>Nom</h2>
              <input
                className="input-detail"
                type="text"
                onChange={(e) => setPrename(e.target.value)}
                value={prename}
              />
            </div>

            <div className="flex flex-col">
              <h2>Prénom</h2>
              <input
                className="input-detail"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
          </div>
          <div className="flex flex-row space-x-2">
            <div className="flex flex-col">
              <h2>Date de naissance</h2>
              <input
                className="input-detail"
                type="text"
                onChange={(e) => setDateDeNaissance(e.target.value)}
                value={dateDeNaissance}
              />
            </div>

            <div className="flex flex-col">
              <h2>Adresse</h2>
              <input
                className="input-detail"
                type="text"
                onChange={(e) => setAdresse(e.target.value)}
                value={adresse}
              />
            </div>
          </div>
          <h2>Email</h2>
          <input
            className="input-detail"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <h2>Telephone</h2>
          <input
            className="input-detail"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleUpdate}
          >
            Enregistrer/Modifier
          </button>
        </div>
      </div>

      {/* display other user details */}
    </div>
  );
}

export default ProfInformation;
