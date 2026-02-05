// Audit service - handles audit logging for compliance and tracking
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import { AuditLog } from "@/src/lib/types";

interface AuditLogInput {
  userId: string;
  action: AuditLog["action"];
  entityType: AuditLog["entityType"];
  entityId: string;
  changes?: AuditLog["changes"];
}

export class AuditService {
  private collection_name = "auditLogs";

  /**
   * Log an action
   */
  async log(input: AuditLogInput): Promise<string> {
    const now = new Date();
    const logData: Omit<AuditLog, "id"> = {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      changes: input.changes,
      timestamp: now,
      ipAddress: undefined, // Could be captured from headers
    };

    const docRef = await addDoc(collection(db, this.collection_name), logData);
    return docRef.id;
  }

  /**
   * Get all audit logs
   */
  async getAllLogs(): Promise<AuditLog[]> {
    const q = query(
      collection(db, this.collection_name),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as AuditLog[];
  }

  /**
   * Subscribe to audit logs (real-time)
   */
  subscribeLogs(callback: (logs: AuditLog[]) => void): () => void {
    const q = query(
      collection(db, this.collection_name),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as AuditLog[];
      callback(logs);
    });
    return unsubscribe;
  }

  /**
   * Get logs by entity
   */
  async getLogsByEntity(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    const q = query(
      collection(db, this.collection_name),
      where("entityType", "==", entityType),
      where("entityId", "==", entityId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as AuditLog[];
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId: string): Promise<AuditLog[]> {
    const q = query(
      collection(db, this.collection_name),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as AuditLog[];
  }

  /**
   * Get logs by action
   */
  async getLogsByAction(action: string): Promise<AuditLog[]> {
    const q = query(
      collection(db, this.collection_name),
      where("action", "==", action),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as AuditLog[];
  }

  /**
   * Get logs within date range
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AuditLog[]> {
    const logs = await this.getAllLogs();
    return logs.filter(
      (log) =>
        log.timestamp >= startDate && log.timestamp <= endDate
    );
  }
}

export const auditService: AuditService = new AuditService();
