import React, { useState } from "react";
import { ProfessorList } from "@/src/components/features/ProfessorList";
import { AddProfessorModal } from "@/src/components/features/AddProfessorModal";

export default function ProfessorsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div>
      <ProfessorList onAddNew={() => setAddModalOpen(true)} />
      <AddProfessorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
