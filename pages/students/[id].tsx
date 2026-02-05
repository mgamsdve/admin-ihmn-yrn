import React from "react";
import { useRouter } from "next/router";
import { StudentDetail } from "@/src/components/features/StudentDetail";

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return <div>Loading...</div>;
  }

  return <StudentDetail studentId={id} />;
}
