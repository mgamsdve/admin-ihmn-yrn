// useConfirm hook - for smart confirmation dialogs
import { useState, useCallback } from "react";
import { ConfirmationDialog } from "@/src/lib/types";

export function useConfirm() {
  const [dialogs, setDialogs] = useState<ConfirmationDialog[]>([]);

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => Promise<void> | void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        dangerous?: boolean;
      }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = Math.random().toString(36).substr(2, 9);

        const dialog: ConfirmationDialog = {
          id,
          title,
          message,
          confirmText: options?.confirmText ?? "Confirm",
          cancelText: options?.cancelText ?? "Cancel",
          dangerous: options?.dangerous ?? false,
          onConfirm: async () => {
            await onConfirm();
            removeDialog(id);
            resolve(true);
          },
          onCancel: () => {
            removeDialog(id);
            resolve(false);
          },
        };

        setDialogs((prev) => [...prev, dialog]);
      });
    },
    []
  );

  const removeDialog = (id: string) => {
    setDialogs((prev) => prev.filter((d) => d.id !== id));
  };

  return { dialogs, confirm, removeDialog };
}
