import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CoursesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/courses");
  }, [router]);

  return null;
}
