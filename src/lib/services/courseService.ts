// Course service - handles all course-related database operations
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
import { Course } from "@/src/lib/types";
import { ENTITY_TYPES, AUDIT_ACTIONS } from "@/src/lib/constants";
import { auditService } from "./auditService";

export class CourseService {
  private collection_name = "courses";

  /**
   * Get all courses
   */
  async getAllCourses(): Promise<Course[]> {
    const snapshot = await getDocs(collection(db, this.collection_name));
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Course[];
  }

  /**
   * Subscribe to all courses (real-time)
   */
  subscribeToCourses(
    callback: (courses: Course[]) => void
  ): () => void {
    const unsubscribe = onSnapshot(collection(db, this.collection_name), (snapshot) => {
      const courses = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Course[];
      callback(courses);
    });
    return unsubscribe;
  }

  /**
   * Get single course by ID
   */
  async getCourseById(id: string): Promise<Course | null> {
    const docRef = doc(db, this.collection_name, id);
    const snapshot = await getDocs(
      query(collection(db, this.collection_name), where("__name__", "==", id))
    );
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      ...data,
      id: snapshot.docs[0].id,
    } as Course;
  }

  /**
   * Subscribe to single course (real-time)
   */
  subscribeToCourse(
    id: string,
    callback: (course: Course | null) => void
  ): () => void {
    const docRef = doc(db, this.collection_name, id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...snapshot.data(),
          id: snapshot.id,
        } as Course);
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  }

  /**
   * Create new course
   */
  async createCourse(
    course: Omit<Course, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<Course> {
    const now = new Date();
    const data = {
      ...course,
      createdAt: now,
      updatedAt: now,
      professorIds: course.professorIds || [],
      studentIds: course.studentIds || [],
    };

    const docRef = await addDoc(
      collection(db, this.collection_name),
      data
    );

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.COURSE,
      entityId: docRef.id,
      changes: { created: data },
    });

    return {
      ...data,
      id: docRef.id,
    } as Course;
  }

  /**
   * Update course
   */
  async updateCourse(
    id: string,
    updates: Partial<Course>,
    userId: string
  ): Promise<void> {
    const docRef = doc(db, this.collection_name, id);
    const now = new Date();

    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.COURSE,
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
   * Delete course
   */
  async deleteCourse(id: string, userId: string): Promise<void> {
    const docRef = doc(db, this.collection_name, id);

    await deleteDoc(docRef);

    await auditService.log({
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.COURSE,
      entityId: id,
      changes: { deleted: true },
    });
  }

  /**
   * Get courses by period
   */
  async getCoursesByPeriod(periodId: string): Promise<Course[]> {
    const q = query(
      collection(db, this.collection_name),
      where("periodId", "==", periodId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Course[];
  }

  /**
   * Get courses by year
   */
  async getCoursesByYear(yearId: string): Promise<Course[]> {
    const q = query(
      collection(db, this.collection_name),
      where("yearId", "==", yearId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Course[];
  }

  /**
   * Get courses count
   */
  async getCourseCount(): Promise<number> {
    const courses = await this.getAllCourses();
    return courses.length;
  }
}

export const courseService: CourseService = new CourseService();
