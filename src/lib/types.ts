// Types for the entire application
// This is the source of truth for all data structures

export type UserRole = "admin" | "professor" | "student";

export type StudentStatus = "active" | "inactive" | "graduated" | "archived";
export type ProfessorStatus = "active" | "inactive" | "on_leave";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends User {
  prename: string;
  dateNaissance?: string;
  année: number; // Academic year
  status: StudentStatus;
  address?: string;
}

export interface Professor extends User {
  prename: string;
  specialization?: string;
  status: ProfessorStatus;
  bio?: string;
}

export interface Period {
  id: string;
  name: string; // "Period 1", "Spring 2024"
  startDate: Date;
  endDate: Date;
  year: number;
  order: number;
}

export interface Year {
  id: string;
  periodId: string;
  name: string; // "1st Year", "L1", "Year 1"
  académic_year: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  periodId: string;
  yearId: string;
  professorIds: string[]; // Can have multiple professors
  studentIds: string[]; // Can have multiple students
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  grade?: number;
  status: "active" | "completed" | "dropped";
  enrolledAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: "create" | "update" | "delete" | "view";
  entityType: "student" | "professor" | "course" | "period" | "year";
  entityId: string;
  changes?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export interface Filter {
  id?: string;
  name?: string;
  year?: number;
  periodId?: string;
  status?: string;
  searchTerm?: string;
}

export interface ExportConfig {
  format: "pdf" | "excel" | "csv";
  columns: string[];
  filters?: Filter;
  timestamp: Date;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  dangerous?: boolean; // Red styling for destructive actions
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
}
