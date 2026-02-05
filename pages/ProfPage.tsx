"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProfPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/professors");
  }, [router]);

  return null;
}
