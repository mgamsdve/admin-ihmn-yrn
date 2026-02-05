// useCourses hook - manage courses collection
import { useState, useEffect, useCallback } from "react";
import { Course } from "@/src/lib/types";
import { courseService } from "@/src/lib/services/courseService";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = courseService.subscribeToCourses((data) => {
      setCourses(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const getById = useCallback(
    (id: string) => courses.find((c) => c.id === id),
    [courses]
  );

  const getByPeriod = useCallback(
    (periodId: string) => courses.filter((c) => c.periodId === periodId),
    [courses]
  );

  const getByYear = useCallback(
    (yearId: string) => courses.filter((c) => c.yearId === yearId),
    [courses]
  );

  const getByProfessor = useCallback(
    (professorId: string) =>
      courses.filter((c) => c.professorIds.includes(professorId)),
    [courses]
  );

  const getByStudent = useCallback(
    (studentId: string) =>
      courses.filter((c) => c.studentIds.includes(studentId)),
    [courses]
  );

  return {
    courses,
    loading,
    error,
    getById,
    getByPeriod,
    getByYear,
    getByProfessor,
    getByStudent,
  };
}
