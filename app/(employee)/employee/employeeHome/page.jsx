import { DataTable, PageHeader, StatusBadge } from "@/components/DashboardShell";
import { getTaskRisk, tasks } from "@/lib/dashboardData";

export default function HomeContent() {
  return (
    <div>
      <PageHeader
        eyebrow="Task focus"
        title="Today's work"
        description="A compact view of active assigned work and deadline signals."
      />
      <DataTable
        columns={[
          { key: "name", label: "Task" },
          { key: "deadline", label: "Deadline" },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "risk", label: "Signal", render: (row) => <StatusBadge status={getTaskRisk(row)} /> },
        ]}
        rows={tasks.filter((task) => task.assignee === "Paolo Reyes")}
      />
    </div>
  );
}
