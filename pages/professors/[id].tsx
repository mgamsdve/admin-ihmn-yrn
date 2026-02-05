import React from "react";
import { useRouter } from "next/router";
import { ProfessorDetail } from "@/src/components/features/ProfessorDetail";

export default function ProfessorDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return <div>Loading...</div>;
  }

  return <ProfessorDetail professorId={id} />;
}
