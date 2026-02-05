import React, { useState } from "react";
import { StudentList } from "@/src/components/features/StudentList";
import { AddStudentModal } from "@/src/components/features/AddStudentModal";

export default function StudentsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div>
      <StudentList onAddNew={() => setAddModalOpen(true)} />
      <AddStudentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
