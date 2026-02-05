"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { designSystem } from "@/src/lib/design-system";

interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

const today = new Date();

const toDateKey = (date: Date) => date.toISOString().split("T")[0];

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ihmn_events");
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ihmn_events", JSON.stringify(events));
  }, [events]);

  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDay = new Date(currentMonth);
  startDay.setDate(1 - currentMonth.getDay());

  const days = Array.from({ length: 42 }).map((_, idx) => {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + idx);
    return date;
  });

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, EventItem[]>>((acc, event) => {
      acc[event.date] = acc[event.date] || [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [events]);

  const eventsForSelected = eventsByDate[selectedDate] || [];

  const addEvent = () => {
    if (!title.trim()) return;
    const newEvent: EventItem = {
      id: `${selectedDate}-${Date.now()}`,
      title: title.trim(),
      date: selectedDate,
      description: description.trim() || undefined,
    };
    setEvents((prev) => [...prev, newEvent]);
    setTitle("");
    setDescription("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.lg }}>
      <div>
        <div style={{ ...designSystem.typography.h2 }}>Agenda</div>
        <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
          Planifiez les événements clés de l'école.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 2fr) minmax(260px, 1fr)",
          gap: designSystem.spacing.lg,
        }}
      >
        <Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: designSystem.spacing.sm,
            }}
          >
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  ...designSystem.typography.bodySmall,
                  color: designSystem.colors.text.secondary,
                }}
              >
                {day}
              </div>
            ))}
            {days.map((date) => {
              const key = toDateKey(date);
              const isCurrentMonth = date.getMonth() === today.getMonth();
              const isSelected = key === selectedDate;
              const count = eventsByDate[key]?.length || 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  style={{
                    border: `1px solid ${isSelected ? designSystem.colors.primary[500] : designSystem.colors.gray[200]}`,
                    borderRadius: designSystem.borderRadius.md,
                    padding: designSystem.spacing.sm,
                    background: isSelected ? designSystem.colors.primary[50] : "white",
                    opacity: isCurrentMonth ? 1 : 0.4,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: designSystem.spacing.xs,
                  }}
                >
                  <span style={{ ...designSystem.typography.body }}>{date.getDate()}</span>
                  {count > 0 && (
                    <span
                      style={{
                        ...designSystem.typography.bodySmall,
                        color: designSystem.colors.primary[600],
                      }}
                    >
                      {count} evt
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ ...designSystem.typography.h4, marginBottom: designSystem.spacing.sm }}>
            Événements du {selectedDate}
          </div>
          {eventsForSelected.length === 0 ? (
            <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
              Aucun événement ce jour.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.sm }}>
              {eventsForSelected.map((event) => (
                <div
                  key={event.id}
                  style={{
                    border: `1px solid ${designSystem.colors.gray[200]}`,
                    borderRadius: designSystem.borderRadius.md,
                    padding: designSystem.spacing.sm,
                  }}
                >
                  <div style={{ ...designSystem.typography.body }}>{event.title}</div>
                  {event.description && (
                    <div style={{ ...designSystem.typography.bodySmall, color: designSystem.colors.text.secondary }}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: designSystem.spacing.md, display: "flex", flexDirection: "column", gap: designSystem.spacing.sm }}>
            <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
            />
            <Button variant="primary" onClick={addEvent}>
              Ajouter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
