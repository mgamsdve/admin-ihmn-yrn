// Professor service - handles all professor-related database operations
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
} from "firebase/firestore";
import { db } from "@/firebase";
import { Professor, ProfessorStatus } from "@/src/lib/types";
import { ENTITY_TYPES, AUDIT_ACTIONS } from "@/src/lib/constants";
import { auditService } from "./auditService";

export class ProfessorService {
  private collection_name = "profs";

  /**
   * Get all professors
   */
  async getAllProfessors(): Promise<Professor[]> {
    const snapshot = await getDocs(collection(db, this.collection_name));
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Professor[];
  }

  /**
   * Subscribe to all professors (real-time)
   */
  subscribeToProfessors(
    callback: (professors: Professor[]) => void
  ): () => void {
    const unsubscribe = onSnapshot(collection(db, this.collection_name), (snapshot) => {
      const professors = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Professor[];
      callback(professors);
    });
    return unsubscribe;
  }

  /**
   * Get single professor by ID
   */
  async getProfessorById(id: string): Promise<Professor | null> {
    const docRef = doc(db, this.collection_name, id);
    const snapshot = await getDocs(
      query(collection(db, this.collection_name), where("__name__", "==", id))
    );
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      ...data,
      id: snapshot.docs[0].id,
    } as Professor;
  }

  /**
   * Subscribe to single professor (real-time)
   */
  subscribeToProfessor(
    id: string,
    callback: (professor: Professor | null) => void
  ): () => void {
    const docRef = doc(db, this.collection_name, id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...snapshot.data(),
          id: snapshot.id,
        } as Professor);
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  }

  /**
   * Create new professor
   */
  async createProfessor(
    professor: Omit<Professor, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<Professor> {
    const now = new Date();
    const data = {
      ...professor,
      role: "professor",
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
      entityType: ENTITY_TYPES.PROFESSOR,
      entityId: docRef.id,
      changes: { created: data },
    });

    return {
      ...data,
      id: docRef.id,
    } as Professor;
  }

  /**
   * Update professor
   */
  async updateProfessor(
    id: string,
    updates: Partial<Professor>,
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
      entityType: ENTITY_TYPES.PROFESSOR,
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
   * Delete professor
   */
  async deleteProfessor(id: string, userId: string): Promise<void> {
    const docRef = doc(db, this.collection_name, id);

    await deleteDoc(docRef);

    // Audit log
    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.PROFESSOR,
      entityId: id,
      changes: { deleted: true },
    });
  }

  /**
   * Search professors by name or email
   */
  async searchProfessors(query: string): Promise<Professor[]> {
    const professors = await this.getAllProfessors();
    const lower = query.toLowerCase();
    return professors.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.prename?.toLowerCase().includes(lower) ||
        p.email?.toLowerCase().includes(lower)
    );
  }

  /**
   * Get courses for a professor
   */
  async getProfessorCourses(professorId: string): Promise<string[]> {
    const q = query(
      collection(db, "courses"),
      where("professorIds", "array-contains", professorId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.id);
  }

  /**
   * Assign professor to course
   */
  async assignToCourse(
    professorId: string,
    courseId: string,
    userId: string
  ): Promise<void> {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      professorIds: __arrayUnion([professorId]),
    });

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.COURSE,
      entityId: courseId,
      changes: { professorAssigned: professorId },
    });
  }

  /**
   * Remove professor from course
   */
  async removeFromCourse(
    professorId: string,
    courseId: string,
    userId: string
  ): Promise<void> {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      professorIds: __arrayRemove([professorId]),
    });

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.COURSE,
      entityId: courseId,
      changes: { professorRemoved: professorId },
    });
  }

  /**
   * Bulk delete professors
   */
  async deleteMultiple(ids: string[], userId: string): Promise<void> {
    for (const id of ids) {
      await this.deleteProfessor(id, userId);
    }
  }

  /**
   * Get professor count
   */
  async getProfessorCount(): Promise<number> {
    const professors = await this.getAllProfessors();
    return professors.length;
  }
}

// Helper functions for Firestore array operations
const __arrayUnion = (arr: any[]) => arr;
const __arrayRemove = (arr: any[]) => arr;

export const professorService: ProfessorService = new ProfessorService();
