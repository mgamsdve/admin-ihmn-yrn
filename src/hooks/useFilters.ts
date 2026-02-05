// useFilters hook - for managing and persisting filters
import { useState, useCallback, useEffect } from "react";
import { Filter } from "@/src/lib/types";
import { LOCAL_STORAGE_KEYS } from "@/src/lib/constants";

export function useFilters(storageKey?: string) {
  const [filters, setFilters] = useState<Filter>({});
  const [savedFilters, setSavedFilters] = useState<Filter[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setFilters(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse stored filters", e);
        }
      }
    }
  }, [storageKey]);

  // Save filters when they change
  const updateFilter = useCallback(
    (key: keyof Filter, value: any) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    },
    [storageKey]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const saveFilterSet = useCallback(
    (name: string) => {
      const filterSet: Filter = {
        ...filters,
        name,
      };
      setSavedFilters((prev) => [...prev, filterSet]);
      if (storageKey) {
        const all = [...savedFilters, filterSet];
        localStorage.setItem(`${storageKey}_saved`, JSON.stringify(all));
      }
    },
    [filters, savedFilters, storageKey]
  );

  const applyFilterSet = useCallback((filterSet: Filter) => {
    const { name, ...filtersOnly } = filterSet;
    setFilters(filtersOnly);
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    savedFilters,
    saveFilterSet,
    applyFilterSet,
  };
}
