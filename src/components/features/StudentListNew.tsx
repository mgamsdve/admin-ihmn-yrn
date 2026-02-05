"use client";

import React, { useState, useMemo, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { designSystem } from "@/src/lib/design-system";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { Spinner } from "@/src/components/ui/Spinner";
import { useToast } from "@/src/hooks/useToast";
import {
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
} from "@/src/lib/constants";

interface StudentListProps {
  onAddNew?: () => void;
}

export function StudentListNew({ onAddNew }: StudentListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    id?: string;
  }>({ show: false });
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter((doc: any) => doc.role === "student");
      setStudents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.prename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setStudents(students.filter((s) => s.id !== id));
      addToast?.("Student deleted", "success");
      setConfirmDelete({ show: false });
    } catch (error) {
      addToast?.("Failed to delete student", "error");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleRowClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: designSystem.spacing.lg,
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: designSystem.spacing.lg,
        }}
      >
        <div>
          <h1
            style={{
              ...designSystem.typography.h2,
              margin: "0",
              color: designSystem.colors.gray[900],
            }}
          >
            Students
          </h1>
          <p
            style={{
              ...designSystem.typography.caption,
              color: designSystem.colors.gray[600],
              margin: "0",
            }}
          >
            {filteredStudents.length} student
            {filteredStudents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" onClick={onAddNew}>
          + Add Student
        </Button>
      </div>

      <div style={{ marginBottom: designSystem.spacing.md }}>
        <SearchInput
          placeholder="Search by name or email..."
          onSearch={setSearchTerm}
        />
      </div>

      <Card>
        {filteredStudents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: designSystem.spacing.lg,
              color: designSystem.colors.gray[600],
            }}
          >
            No students found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `2px solid ${designSystem.colors.gray[200]}`,
                  }}
                >
                  <th
                    style={{
                      padding: designSystem.spacing.md,
                      textAlign: "left",
                      fontWeight: 600,
                      color: designSystem.colors.gray[700],
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredStudents.length &&
                        filteredStudents.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th
                    style={{
                      padding: designSystem.spacing.md,
                      textAlign: "left",
                      fontWeight: 600,
                      color: designSystem.colors.gray[700],
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: designSystem.spacing.md,
                      textAlign: "left",
                      fontWeight: 600,
                      color: designSystem.colors.gray[700],
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: designSystem.spacing.md,
                      textAlign: "left",
                      fontWeight: 600,
                      color: designSystem.colors.gray[700],
                    }}
                  >
                    Year
                  </th>
                  <th
                    style={{
                      padding: designSystem.spacing.md,
                      textAlign: "left",
                      fontWeight: 600,
                      color: designSystem.colors.gray[700],
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: designSystem.spacing.md,
                      textAlign: "left",
                      fontWeight: 600,
                      color: designSystem.colors.gray[700],
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: `1px solid ${designSystem.colors.gray[100]}`,
                      backgroundColor:
                        idx % 2 === 0 ? "white" : designSystem.colors.gray[50],
                      cursor: "pointer",
                      transition: `background-color ${designSystem.transitions.base}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        designSystem.colors.primary[50];
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        idx % 2 === 0 ? "white" : designSystem.colors.gray[50];
                    }}
                  >
                    <td style={{ padding: designSystem.spacing.md }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student.id)}
                        onChange={(e) =>
                          handleSelectRow(student.id, e.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td
                      style={{
                        padding: designSystem.spacing.md,
                        ...designSystem.typography.body,
                        color: designSystem.colors.gray[900],
                        fontWeight: 500,
                      }}
                      onClick={() => handleRowClick(student.id)}
                    >
                      {student.prename} {student.name}
                    </td>
                    <td
                      style={{
                        padding: designSystem.spacing.md,
                        ...designSystem.typography.body,
                        color: designSystem.colors.gray[600],
                      }}
                      onClick={() => handleRowClick(student.id)}
                    >
                      {student.email || "-"}
                    </td>
                    <td
                      style={{
                        padding: designSystem.spacing.md,
                        ...designSystem.typography.body,
                        color: designSystem.colors.gray[700],
                      }}
                      onClick={() => handleRowClick(student.id)}
                    >
                      Year {student.année || "-"}
                    </td>
                    <td
                      style={{
                        padding: designSystem.spacing.md,
                      }}
                      onClick={() => handleRowClick(student.id)}
                    >
                      <Badge
                        variant={STUDENT_STATUS_COLORS[student.status] as any}
                      >
                        {STUDENT_STATUS_LABELS[student.status] || "Unknown"}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: designSystem.spacing.md,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setConfirmDelete({ show: true, id: student.id })
                        }
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false })}
        title="Delete Student"
      >
        <div
          style={{
            color: designSystem.colors.gray[700],
            marginBottom: designSystem.spacing.lg,
          }}
        >
          Are you sure you want to delete this student? This action cannot be
          undone.
        </div>
        <div
          style={{
            display: "flex",
            gap: designSystem.spacing.md,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setConfirmDelete({ show: false })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => confirmDelete.id && handleDelete(confirmDelete.id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
