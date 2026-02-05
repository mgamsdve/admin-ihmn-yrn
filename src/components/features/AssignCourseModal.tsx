"use client";

import React, { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { designSystem } from "@/src/lib/design-system";
import { CoursePicker, CourseSelection } from "@/src/components/features/CoursePicker";

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: CourseSelection) => Promise<void> | void;
  title: string;
}

export function AssignCourseModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: AssignCourseModalProps) {
  const [selected, setSelected] = useState<CourseSelection | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onConfirm(selected);
      onClose();
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" loading={loading} onClick={handleConfirm}>
            Assigner
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
        <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
          Choisissez un cours pour appliquer l'assignation à la sélection.
        </div>
        <CoursePicker onSelect={setSelected} selected={selected} />
        {selected && (
          <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.primary }}>
            Cours sélectionné: {selected.courseName} ({selected.periodId} • {selected.yearId})
          </div>
        )}
      </div>
    </Modal>
  );
}
