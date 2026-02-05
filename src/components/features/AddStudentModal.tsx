"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { Select } from "@/src/components/ui/Select";
import { useToast } from "@/src/hooks/useToast";
import { spacing, typography, colors } from "@/src/lib/design-system";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "graduated", label: "Diplômé" },
  { value: "archived", label: "Archivé" },
];

const yearOptions = [
  { value: "1", label: "Année 1" },
  { value: "2", label: "Année 2" },
  { value: "3", label: "Année 3" },
  { value: "4", label: "Année 4" },
];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prename: "",
    name: "",
    email: "",
    phone: "",
    dateNaissance: "",
    adresse: "",
    annee: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: showError } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.prename) newErrors.prename = "Nom requis";
    if (!formData.name) newErrors.name = "Prénom requis";
    if (!formData.email) newErrors.email = "Email requis";
    if (!formData.dateNaissance) newErrors.dateNaissance = "Date requise";
    if (!formData.annee) newErrors.annee = "Année requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const yearNumber = formData.annee ? parseInt(formData.annee, 10) : null;
      await addDoc(collection(db, "users"), {
        prename: formData.prename,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateDeNaissance: formData.dateNaissance,
        dateNaissance: formData.dateNaissance,
        adresse: formData.adresse,
        annee: formData.annee,
        année: yearNumber || formData.annee,
        status: formData.status,
        role: "student",
        createdAt: new Date(),
        profilePic: null,
      });
      success("Étudiant créé avec succès");
      onClose();
      setFormData({
        prename: "",
        name: "",
        email: "",
        phone: "",
        dateNaissance: "",
        adresse: "",
        annee: "",
        status: "active",
      });
    } catch (err) {
      showError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un nouvel étudiant"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Créer étudiant
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: spacing[6] }}>
        <div>
          <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing[1] }}>
            Informations principales
          </div>
          <div style={{ ...typography.bodySmall, color: colors.text.secondary }}>
            Renseignez les informations essentielles de l'étudiant.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[4] }}>
          <Input
            label="Nom"
            value={formData.prename}
            onChange={(e) => {
              setFormData({ ...formData, prename: e.target.value });
              if (errors.prename) setErrors({ ...errors, prename: "" });
            }}
            error={errors.prename}
          />
          <Input
            label="Prénom"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            error={errors.email}
          />
          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Date de naissance"
            type="date"
            value={formData.dateNaissance}
            onChange={(e) => {
              setFormData({ ...formData, dateNaissance: e.target.value });
              if (errors.dateNaissance) setErrors({ ...errors, dateNaissance: "" });
            }}
            error={errors.dateNaissance}
          />
          <Select
            label="Année"
            value={formData.annee}
            onChange={(value) => {
              setFormData({ ...formData, annee: value });
              if (errors.annee) setErrors({ ...errors, annee: "" });
            }}
            options={yearOptions}
            placeholder="Choisir une année"
            error={errors.annee}
          />
          <Select
            label="Statut"
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={statusOptions}
          />
          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            style={{ gridColumn: "1 / -1" }}
          />
        </div>
      </div>
    </Modal>
  );
};
