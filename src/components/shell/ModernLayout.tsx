"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  transitions,
  shadows,
} from "@/src/lib/design-system";

interface ModernLayoutProps {
  children: React.ReactNode;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ihmn_settings");
    if (!stored) return;
    const settings = JSON.parse(stored);
    const cardSize = settings.cardSize || "default";
    const cardPadding =
      cardSize === "compact"
        ? "1rem"
        : cardSize === "large"
          ? "2rem"
          : "1.5rem";
    document.documentElement.style.setProperty("--ihmn-card-padding", cardPadding);
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: "📊", href: "/" },
    { label: "Étudiants", icon: "👥", href: "/students" },
    { label: "Professeurs", icon: "👨‍🏫", href: "/professors" },
    { label: "Cours", icon: "📚", href: "/courses" },
    { label: "Agenda", icon: "🗓️", href: "/events" },
    { label: "Présences", icon: "✅", href: "/attendance" },
    { label: "Paramètres", icon: "⚙️", href: "/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === href;
    return router.pathname.startsWith(href);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: colors.bg,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "260px" : "84px",
          backgroundColor: "#ffffff",
          color: colors.text.primary,
          display: "flex",
          flexDirection: "column",
          transition: `width ${transitions.base}`,
          borderRight: `1px solid ${colors.border}`,
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100,
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: spacing[4],
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing[2],
          }}
        >
          {sidebarOpen && (
            <div
              style={{
                ...typography.h3,
                fontWeight: 800,
                color: colors.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              IHMN
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: colors.gray[100],
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.full,
              color: colors.text.secondary,
              cursor: "pointer",
              fontSize: "16px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: `all ${transitions.fast}`,
            }}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {/* Menu Items */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: spacing[1],
            padding: spacing[2],
          }}
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing[3],
                padding: `${spacing[3]} ${spacing[3]}`,
                borderRadius: borderRadius.base,
                backgroundColor: isActive(item.href)
                  ? colors.primary[50]
                  : "transparent",
                color: isActive(item.href)
                  ? colors.primary[700]
                  : colors.text.secondary,
                transition: `all ${transitions.fast}`,
                textDecoration: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = colors.gray[100];
                  e.currentTarget.style.color = colors.text.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.text.secondary;
                }
              }}
            >
              <span
                style={{ fontSize: "18px", width: "24px", textAlign: "center" }}
              >
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{ ...typography.body, fontWeight: 500 }}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div
          style={{
            padding: spacing[2],
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <button
            onClick={() => {
              logout();
              router.push("/Login");
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: spacing[3],
              padding: `${spacing[3]} ${spacing[3]}`,
              borderRadius: borderRadius.base,
              backgroundColor: "transparent",
              color: colors.danger[600],
              border: `1px solid ${colors.border}`,
              cursor: "pointer",
              transition: `all ${transitions.fast}`,
              ...typography.body,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.danger[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span
              style={{ fontSize: "18px", width: "24px", textAlign: "center" }}
            >
              🚪
            </span>
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? "260px" : "84px",
          flex: 1,
          transition: `margin-left ${transitions.base}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: `1px solid ${colors.border}`,
            padding: `${spacing[4]} ${spacing[6]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ ...typography.body, color: colors.text.secondary }}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing[3],
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  ...typography.body,
                  color: colors.text.primary,
                  fontWeight: 500,
                }}
              >
                Administrateur
              </div>
              <div
                style={{
                  ...typography.bodySmall,
                  color: colors.text.secondary,
                }}
              >
                {user?.email}
              </div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary[500],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                ...typography.h3,
                boxShadow: shadows.xs,
              }}
            >
              👤
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: spacing[6],
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
