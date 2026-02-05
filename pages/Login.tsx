"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { useToast } from "@/src/hooks/useToast";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/src/lib/design-system";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "Email requis";
    } else if (!email.includes("@")) {
      newErrors.email = "Email invalide";
    }
    if (!password) {
      newErrors.password = "Mot de passe requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (email !== "ihmnprivate.app@gmail.com") {
        setErrors({
          email: "Email non autorisé. Utilisez: ihmnprivate.app@gmail.com",
        });
        setLoading(false);
        return;
      }

      await login(email, password);
      success("Connexion réussie !");
      router.push("/");
    } catch (err: any) {
      const errorMessage = err?.message || "Erreur de connexion";
      if (errorMessage.includes("wrong-password")) {
        showError("Mot de passe incorrect");
      } else if (errorMessage.includes("user-not-found")) {
        showError("Utilisateur introuvable");
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: colors.gray[50],
        backgroundImage: `
          radial-gradient(circle at top left, ${colors.primary[100]} 0%, transparent 45%),
          radial-gradient(circle at 20% 100%, ${colors.primary[50]} 0%, transparent 55%)
        `,
        padding: spacing[4],
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "420px",
          boxShadow: shadows.md,
          border: `1px solid ${colors.border}`,
        }}
        variant="elevated"
      >
        {/* Header */}
        <div style={{ marginBottom: spacing[6], textAlign: "center" }}>
          <div
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing[1],
              fontWeight: 700,
            }}
          >
            IHMN
          </div>
          <div
            style={{
              ...typography.bodySmall,
              color: colors.text.secondary,
            }}
          >
            Plateforme d'administration scolaire
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}
        >
          <div
            style={{
              padding: spacing[3],
              borderRadius: borderRadius.base,
              backgroundColor: colors.gray[50],
              border: `1px solid ${colors.border}`,
              ...typography.bodySmall,
              color: colors.text.secondary,
            }}
          >
            Connexion sécurisée à votre espace d'administration.
          </div>
          <Input
            type="email"
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            hint="Demo: ihmnprivate.app@gmail.com"
          />

          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Connexion
          </Button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: spacing[6],
            paddingTop: spacing[4],
            borderTop: `1px solid ${colors.border}`,
            textAlign: "center",
            ...typography.bodySmall,
            color: colors.text.secondary,
          }}
        >
          Accès administrateur sécurisé
        </div>
      </Card>
    </div>
  );
}
