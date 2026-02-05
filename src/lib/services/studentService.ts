// Student service - handles all student-related database operations
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
  Query,
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  Student,
  StudentStatus,
  AuditLog,
  Enrollment,
} from "@/src/lib/types";
import { ENTITY_TYPES, AUDIT_ACTIONS } from "@/src/lib/constants";
import { auditService } from "./auditService";

export class StudentService {
  private collection_name = "users";

  /**
   * Get all students
   */
  async getAllStudents(): Promise<Student[]> {
    const q = query(
      collection(db, this.collection_name),
      where("role", "==", "student")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Student[];
  }

  /**
   * Subscribe to all students (real-time)
   */
  subscribeToStudents(
    callback: (students: Student[]) => void
  ): () => void {
    const q = query(
      collection(db, this.collection_name),
      where("role", "==", "student")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Student[];
      callback(students);
    });
    return unsubscribe;
  }

  /**
   * Get single student by ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    const docRef = doc(db, this.collection_name, id);
    const snapshot = await getDocs(
      query(collection(db, this.collection_name), where("__name__", "==", id))
    );
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      ...data,
      id: snapshot.docs[0].id,
    } as Student;
  }

  /**
   * Subscribe to single student (real-time)
   */
  subscribeToStudent(
    id: string,
    callback: (student: Student | null) => void
  ): () => void {
    const docRef = doc(db, this.collection_name, id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...snapshot.data(),
          id: snapshot.id,
        } as Student);
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  }

  /**
   * Create new student
   */
  async createStudent(
    student: Omit<Student, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<Student> {
    const now = new Date();
    const data = {
      ...student,
      role: "student",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(
      collection(db, this.collection_name),
      data
    );

    // Audit log
    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.STUDENT,
      entityId: docRef.id,
      changes: { created: data },
    });

    return {
      ...data,
      id: docRef.id,
    } as Student;
  }

  /**
   * Update student
   */
  async updateStudent(
    id: string,
    updates: Partial<Student>,
    userId: string
  ): Promise<void> {
    const docRef = doc(db, this.collection_name, id);
    const now = new Date();

    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    // Audit log
    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.STUDENT,
      entityId: id,
      changes: {
        updated: {
          before: {},
          after: updates,
        },
      },
    });
  }

  /**
   * Delete student
   */
  async deleteStudent(id: string, userId: string): Promise<void> {
    const docRef = doc(db, this.collection_name, id);

    await deleteDoc(docRef);

    // Audit log
    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.STUDENT,
      entityId: id,
      changes: { deleted: true },
    });
  }

  /**
   * Search students by name or email
   */
  async searchStudents(query: string): Promise<Student[]> {
    const students = await this.getAllStudents();
    const lower = query.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(lower) ||
        s.prename?.toLowerCase().includes(lower) ||
        s.email?.toLowerCase().includes(lower)
    );
  }

  /**
   * Filter students by status
   */
  async getStudentsByStatus(status: StudentStatus): Promise<Student[]> {
    const q = query(
      collection(db, this.collection_name),
      where("role", "==", "student"),
      where("status", "==", status)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Student[];
  }

  /**
   * Filter students by year
   */
  async getStudentsByYear(year: number): Promise<Student[]> {
    const q = query(
      collection(db, this.collection_name),
      where("role", "==", "student"),
      where("année", "==", year)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Student[];
  }

  /**
   * Get courses for a student
   */
  async getStudentCourses(studentId: string): Promise<string[]> {
    // This assumes courses collection has studentIds array
    const q = query(
      collection(db, "courses"),
      where("studentIds", "array-contains", studentId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.id);
  }

  /**
   * Assign student to course
   */
  async assignToCourse(
    studentId: string,
    courseId: string,
    userId: string
  ): Promise<void> {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      studentIds: __arrayUnion([studentId]),
    });

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.COURSE,
      entityId: courseId,
      changes: { studentAssigned: studentId },
    });
  }

  /**
   * Remove student from course
   */
  async removeFromCourse(
    studentId: string,
    courseId: string,
    userId: string
  ): Promise<void> {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      studentIds: __arrayRemove([studentId]),
    });

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.COURSE,
      entityId: courseId,
      changes: { studentRemoved: studentId },
    });
  }

  /**
   * Bulk delete students
   */
  async deleteMultiple(ids: string[], userId: string): Promise<void> {
    for (const id of ids) {
      await this.deleteStudent(id, userId);
    }
  }

  /**
   * Get student count
   */
  async getStudentCount(): Promise<number> {
    const students = await this.getAllStudents();
    return students.length;
  }
}

// Helper functions for Firestore array operations
const __arrayUnion = (arr: any[]) => arr;
const __arrayRemove = (arr: any[]) => arr;

export const studentService: StudentService = new StudentService();
