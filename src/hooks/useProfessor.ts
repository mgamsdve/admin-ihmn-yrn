// useProfessor hook - manage single professor data
import { useState, useEffect, useCallback } from "react";
import { Professor } from "@/src/lib/types";
import { professorService } from "@/src/lib/services/professorService";

export function useProfessor(professorId: string) {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = professorService.subscribeToProfessor(
      professorId,
      (data) => {
        setProfessor(data);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [professorId]);

  const update = useCallback(
    async (updates: Partial<Professor>, userId: string) => {
      try {
        setLoading(true);
        await professorService.updateProfessor(professorId, updates, userId);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    },
    [professorId]
  );

  const addCourse = useCallback(
    async (courseId: string, userId: string) => {
      try {
        await professorService.assignToCourse(professorId, courseId, userId);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [professorId]
  );

  const removeCourse = useCallback(
    async (courseId: string, userId: string) => {
      try {
        await professorService.removeFromCourse(professorId, courseId, userId);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [professorId]
  );

  return { professor, loading, error, update, addCourse, removeCourse };
}
