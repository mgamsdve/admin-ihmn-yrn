"use client";

import React, { useState, useEffect } from "react";
import { auditService } from "@/src/lib/services/auditService";
import type { AuditLog, User } from "@/src/lib/types";
import { AUDIT_ACTION_LABELS, ENTITY_TYPES } from "@/src/lib/constants";
import { designSystem } from "@/src/lib/design-system";
import { Card } from "@/src/components/ui/Card";
import { Table } from "@/src/components/ui/Table";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { Pagination } from "@/src/components/ui/Pagination";
import { Spinner } from "@/src/components/ui/Spinner";
import { Badge } from "@/src/components/ui/Badge";

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Subscribe to audit logs
  useEffect(() => {
    setLoading(true);
    const unsubscribe = auditService.subscribeLogs((data) => {
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter logs
  useEffect(() => {
    let result = logs;

    if (filters.action) {
      result = result.filter((log) => log.action === filters.action);
    }
    if (filters.entityType) {
      result = result.filter((log) => log.entityType === filters.entityType);
    }
    if (filters.userId) {
      result = result.filter((log) =>
        log.userId.toLowerCase().includes(filters.userId.toLowerCase()),
      );
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      result = result.filter((log) => log.timestamp >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((log) => log.timestamp <= end);
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [logs, filters]);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const formatDate = (date: Date | any) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "success";
      case "update":
        return "info";
      case "delete":
        return "danger";
      case "view":
        return "gray";
      default:
        return "gray";
    }
  };

  const filterConfig = [
    {
      key: "action",
      label: "Action",
      type: "select" as const,
      options: [
        { value: "create", label: "Create" },
        { value: "update", label: "Update" },
        { value: "delete", label: "Delete" },
        { value: "view", label: "View" },
      ],
    },
    {
      key: "entityType",
      label: "Entity Type",
      type: "select" as const,
      options: [
        { value: "student", label: "Student" },
        { value: "professor", label: "Professor" },
        { value: "course", label: "Course" },
        { value: "period", label: "Period" },
        { value: "year", label: "Year" },
      ],
    },
    {
      key: "userId",
      label: "User ID",
      type: "text" as const,
      placeholder: "Search by user",
    },
    {
      key: "startDate",
      label: "From",
      type: "date" as const,
    },
    {
      key: "endDate",
      label: "To",
      type: "date" as const,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <h1
          style={{
            ...designSystem.typography.h2,
            margin: "0 0 " + designSystem.spacing.md + " 0",
            color: designSystem.colors.gray[900],
          }}
        >
          Audit Logs
        </h1>
        <p
          style={{
            ...designSystem.typography.body,
            color: designSystem.colors.gray[600],
            margin: 0,
          }}
        >
          Complete history of all actions performed in the system
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters({ ...filters, [key]: value })
        }
        onClear={() =>
          setFilters({
            action: "",
            entityType: "",
            userId: "",
            startDate: "",
            endDate: "",
          })
        }
        filterConfig={filterConfig}
      />

      <Card>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: designSystem.spacing.lg,
            }}
          >
            <Spinner />
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: designSystem.spacing.lg,
              color: designSystem.colors.gray[600],
            }}
          >
            No audit logs found
          </div>
        ) : (
          <>
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  ...designSystem.typography.body,
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
                      Time
                    </th>
                    <th
                      style={{
                        padding: designSystem.spacing.md,
                        textAlign: "left",
                        fontWeight: 600,
                        color: designSystem.colors.gray[700],
                      }}
                    >
                      Action
                    </th>
                    <th
                      style={{
                        padding: designSystem.spacing.md,
                        textAlign: "left",
                        fontWeight: 600,
                        color: designSystem.colors.gray[700],
                      }}
                    >
                      Entity
                    </th>
                    <th
                      style={{
                        padding: designSystem.spacing.md,
                        textAlign: "left",
                        fontWeight: 600,
                        color: designSystem.colors.gray[700],
                      }}
                    >
                      User
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: `1px solid ${designSystem.colors.gray[100]}`,
                        backgroundColor:
                          idx % 2 === 0
                            ? "white"
                            : designSystem.colors.gray[50],
                      }}
                    >
                      <td style={{ padding: designSystem.spacing.md }}>
                        {formatDate(log.timestamp)}
                      </td>
                      <td style={{ padding: designSystem.spacing.md }}>
                        <Badge variant={getActionColor(log.action) as any}>
                          {AUDIT_ACTION_LABELS[log.action]}
                        </Badge>
                      </td>
                      <td style={{ padding: designSystem.spacing.md }}>
                        <Badge variant="gray">{log.entityType}</Badge>
                      </td>
                      <td style={{ padding: designSystem.spacing.md }}>
                        <code
                          style={{
                            ...designSystem.typography.caption,
                            backgroundColor: designSystem.colors.gray[100],
                            padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                            borderRadius: designSystem.borderRadius.sm,
                          }}
                        >
                          {log.userId.substring(0, 8)}...
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
            />
          </>
        )}
      </Card>
    </div>
  );
}
