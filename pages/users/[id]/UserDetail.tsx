import { useEffect } from "react";
import { useRouter } from "next/router";

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === "string") {
      router.replace(`/students/${id}`);
    }
  }, [id, router]);

  return null;
}
