import React from "react";

type Props = {};

function CoursesToolBar({
  searchValue,
  setSearchValue,
  searchValueperiods,
  setSearchValuePeriods,
  handleOpen,
  handleDelete,
  handleFicheOpen,
}) {
  return (
    <div className="bg-white w-full h-50 md:h-20 shadow-md rounded-lg flex flex-col md:flex-row space-y-3 md:space-x-5 md:space-y-0 p-5">
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
        className="text-green-600 hover:bg-green-50 px-2 rounded-md duration-300"
      >
        Ajouter un cour
      </button>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:bg-red-50 rounded-md px-2 duration-300"
      >
        Supprimer des cours
      </button>
      <button
        onClick={handleFicheOpen}
        className="text-blue-600 hover:bg-blue-50 rounded-md px-2 duration-300"
      >
        Creer une fiche de presence
      </button>
    </div>
  );
}

export default CoursesToolBar;
