import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProfDetail() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === "string") {
      router.replace(`/professors/${id}`);
    }
  }, [id, router]);

  return null;
}
