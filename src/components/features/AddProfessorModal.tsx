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

interface AddProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "on_leave", label: "En congé" },
];

export const AddProfessorModal: React.FC<AddProfessorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prename: "",
    name: "",
    email: "",
    phone: "",
    specialite: "",
    adresse: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: showError } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.prename) newErrors.prename = "Nom requis";
    if (!formData.name) newErrors.name = "Prénom requis";
    if (!formData.email) newErrors.email = "Email requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "profs"), {
        prename: formData.prename,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialite: formData.specialite,
        specialization: formData.specialite,
        adresse: formData.adresse,
        status: formData.status,
        createdAt: new Date(),
        profilePic: null,
      });
      success("Professeur créé avec succès");
      onClose();
      setFormData({
        prename: "",
        name: "",
        email: "",
        phone: "",
        specialite: "",
        adresse: "",
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
      title="Ajouter un nouveau professeur"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Créer professeur
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
            Ajoutez les informations essentielles du professeur.
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
            label="Spécialité"
            value={formData.specialite}
            onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
            placeholder="ex: Mathématiques"
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
