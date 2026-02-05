// Application constants
// Use these instead of magic strings throughout the app

export const ROLES = {
  ADMIN: "admin",
  PROFESSOR: "professor",
  STUDENT: "student",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  professor: "Professor",
  student: "Student",
};

export const STUDENT_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  GRADUATED: "graduated",
  ARCHIVED: "archived",
} as const;

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
  archived: "Archived",
};

export const STUDENT_STATUS_COLORS: Record<string, string> = {
  active: "success",
  inactive: "warning",
  graduated: "primary",
  archived: "gray",
};

export const PROFESSOR_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
} as const;

export const PROFESSOR_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
};

export const PROFESSOR_STATUS_COLORS: Record<string, string> = {
  active: "success",
  inactive: "warning",
  on_leave: "info",
};

export const AUDIT_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  VIEW: "view",
} as const;

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  view: "Viewed",
};

export const ENTITY_TYPES = {
  STUDENT: "student",
  PROFESSOR: "professor",
  COURSE: "course",
  PERIOD: "period",
  YEAR: "year",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  STUDENTS: "/students",
  STUDENT_DETAIL: (id: string) => `/students/${id}`,
  PROFESSORS: "/professors",
  PROFESSOR_DETAIL: (id: string) => `/professors/${id}`,
  COURSES: "/courses",
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  AUDIT: "/audit",
  SETTINGS: "/settings",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const ANIMATIONS = {
  DURATION_FAST: 150,
  DURATION_NORMAL: 300,
  DURATION_SLOW: 500,
} as const;

export const MESSAGES = {
  CONFIRM_DELETE: "Are you sure? This action cannot be undone.",
  CONFIRM_DELETE_STUDENT: (name: string) =>
    `Delete student "${name}"? All associated data will be removed.`,
  CONFIRM_DELETE_PROFESSOR: (name: string) =>
    `Delete professor "${name}"? All course assignments will be removed.`,
  CONFIRM_DELETE_COURSE: (name: string) =>
    `Delete course "${name}"? Students will be unassigned.`,
  SUCCESS_CREATE: (entity: string) => `${entity} created successfully`,
  SUCCESS_UPDATE: (entity: string) => `${entity} updated successfully`,
  SUCCESS_DELETE: (entity: string) => `${entity} deleted successfully`,
  ERROR_GENERIC: "An error occurred. Please try again.",
  ERROR_FETCH: "Failed to fetch data. Please refresh.",
  ERROR_SAVE: "Failed to save changes. Please try again.",
  ERROR_DELETE: "Failed to delete. Please try again.",
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_BIO_LENGTH: 500,
} as const;

export const LOCAL_STORAGE_KEYS = {
  FILTERS: "ihmn_filters",
  PREFERENCES: "ihmn_preferences",
  RECENT_SEARCHES: "ihmn_recent_searches",
} as const;
