// useStudent hook - manage single student data
import { useState, useEffect, useCallback } from "react";
import { Student } from "@/src/lib/types";
import { studentService } from "@/src/lib/services/studentService";

export function useStudent(studentId: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = studentService.subscribeToStudent(studentId, (data) => {
      setStudent(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [studentId]);

  const update = useCallback(
    async (updates: Partial<Student>, userId: string) => {
      try {
        setLoading(true);
        await studentService.updateStudent(studentId, updates, userId);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    },
    [studentId]
  );

  const addCourse = useCallback(
    async (courseId: string, userId: string) => {
      try {
        await studentService.assignToCourse(studentId, courseId, userId);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [studentId]
  );

  const removeCourse = useCallback(
    async (courseId: string, userId: string) => {
      try {
        await studentService.removeFromCourse(studentId, courseId, userId);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [studentId]
  );

  return { student, loading, error, update, addCourse, removeCourse };
}
