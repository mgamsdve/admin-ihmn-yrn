"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function StudentPages() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/students");
  }, [router]);

  return null;
}
