"use client";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { GridToolbar } from "@mui/x-data-grid";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { StripedDataGrid } from "@/Components/StrippedDataGrid";
import { db } from "@/firebase";
import addUser, { deleteDocuments } from "../firebaseFun";
import { useRouter } from "next/router";
import NewUserDialogContent from "@/Components/NewUserDialogContent";
import Image from "next/image";
export default function StudentDataGrid() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const router = useRouter();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleRowClick = (params) => {
    router.push(`/users/${params.row.id}/UserDetail`);
  };
  const handleSelection = (params, e) => {
    setSelectedIds(params);
  };

  async function handleDeleteUsers(e) {
    if (confirm("Voulez-vous vraiment supprimer ces utilisateurs ?")) {
      await deleteDocuments("users", selectedIds);
      alert("Les utilisateurs ont été supprimés");
    } else {
      alert("Rien n'a été supprimé");
    }
  }

  const CustomToolbar = () => {
    return (
      <div className="sm:flex space-x-5 ml-5">
        <button
          onClick={handleOpen}
          className="text-green-600 text-lg  p-2 rounded-md w-fit mt-2 hover:bg-green-50 duration-200"
        >
          + Ajouter
        </button>
        <button
          onClick={handleDeleteUsers}
          className="text-red-600 text-lg  p-2 rounded-md w-fit mt-2 hover:bg-red-50 duration-200"
        >
          ⚠ Suprimer
        </button>
        <GridToolbar />
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => usersData.push({ ...doc.data(), id: doc.id }));
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 30 },
    {
      field: "profilePic",
      headerName: "Photo",
      width: 130,

      renderCell: (params) => (
        <Image
          width={90}
          height={90}
          src={
            params.value
              ? params.value
              : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          }
          alt="Profile Pic"
          className="transition-opacity opacity-0 duration-[0.5s] rounded-full w-14 h-14"
          onLoadingComplete={(image) => image.classList.remove("opacity-0")}
        />
      ),
    },
    { field: "prename", headerName: "Nom", width: 130 },
    { field: "name", headerName: "Prenom", width: 130 },
    {
      field: "dateDeNaissance",
      headerName: "Date de naissance",
      width: 130,
    },
    { field: "anneeCourante", headerName: "Annee Courante", width: 130 },
    { field: "adresse", headerName: "Adresse", width: 130 },
    { field: "phone", headerName: "Phone", width: 130 },
  ];

  return (
    <div className="w-full h-screen bg-gray-50 overflow-y-scroll">
      <div className="p-5 w-full">
        <div className="shadow-md bg-white">
          <StripedDataGrid
            rowHeight={55}
            rows={users}
            columns={columns}
            onRowSelectionModelChange={handleSelection}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: CustomToolbar }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            onRowDoubleClick={handleRowClick}
          />
        </div>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="xl"
          PaperProps={{
            style: {
              width: "800px",
              height: "900px",
            },
          }}
        >
          <DialogTitle>Ajouter un élève</DialogTitle>
          <DialogContent>
            <NewUserDialogContent handleClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
