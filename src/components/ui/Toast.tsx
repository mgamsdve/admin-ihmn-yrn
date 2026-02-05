import React, { useEffect } from "react";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  transitions,
  shadows,
} from "@/src/lib/design-system";
import { Spinner } from "./Spinner";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 4000,
  action,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig: Record<
    string,
    { bg: string; border: string; text: string; icon: string }
  > = {
    success: {
      bg: colors.success[50],
      border: colors.success[200],
      text: colors.success[700],
      icon: "✓",
    },
    error: {
      bg: colors.danger[50],
      border: colors.danger[200],
      text: colors.danger[700],
      icon: "✕",
    },
    warning: {
      bg: colors.warning[50],
      border: colors.warning[200],
      text: colors.warning[700],
      icon: "!",
    },
    info: {
      bg: colors.primary[50],
      border: colors.primary[200],
      text: colors.primary[700],
      icon: "ℹ",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing[3],
        padding: spacing[4],
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: borderRadius.base,
        boxShadow: shadows.md,
        animation: `slideIn ${transitions.base}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Icon */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          borderRadius: borderRadius.full,
          backgroundColor: config.text,
          color: config.bg,
          ...typography.label,
          fontWeight: 700,
        }}
      >
        {config.icon}
      </span>

      {/* Message */}
      <span
        style={{
          flex: 1,
          color: config.text,
          ...typography.body,
        }}
      >
        {message}
      </span>

      {/* Action button */}
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onClose();
          }}
          style={{
            background: "none",
            border: "none",
            color: config.text,
            cursor: "pointer",
            fontWeight: 600,
            textDecoration: "underline",
            ...typography.bodySmall,
          }}
        >
          {action.label}
        </button>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: config.text,
          cursor: "pointer",
          fontSize: "20px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.6,
          transition: `opacity ${transitions.fast}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.6";
        }}
      >
        ✕
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: spacing[4],
        right: spacing[4],
        display: "flex",
        flexDirection: "column",
        gap: spacing[3],
        zIndex: 9999,
        maxWidth: "400px",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
