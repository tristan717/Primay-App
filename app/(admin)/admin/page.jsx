import { AlertTriangle, CheckCircle2, ClipboardList, FolderKanban, Users } from "lucide-react";
import { DataTable, PageHeader, StatGrid, StatusBadge } from "@/components/DashboardShell";
import { getDashboardStats, getTaskRisk, projects, tasks, users } from "@/lib/dashboardData";

export default function AdminDashboardPage() {
  const stats = getDashboardStats();
  const workloadRows = users.filter((user) => user.role === "EMPLOYEE");

  return (
    <div>
      <PageHeader
        eyebrow="Admin workspace"
        title="Project risk and workload overview"
        description="Monitor active work, detect deadline risk early, and see where team capacity needs attention."
      />

      <StatGrid
        stats={[
          { label: "Active tasks", value: stats.activeTasks, caption: "Not yet completed", icon: ClipboardList },
          { label: "At-risk projects", value: stats.atRiskProjects, caption: "Needs manager attention", icon: FolderKanban },
          { label: "Risk signals", value: stats.riskyTasks, caption: "Overdue, blocked, or due soon", icon: AlertTriangle },
          { label: "Overloaded employees", value: stats.overloadedUsers, caption: "5 or more active tasks", icon: Users },
        ]}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <h2 className="mb-3 text-lg font-bold text-zinc-950">Projects needing attention</h2>
          <DataTable
            columns={[
              { key: "name", label: "Project" },
              { key: "lead", label: "Lead" },
              { key: "progress", label: "Progress", render: (row) => `${row.progress}%` },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={projects}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-zinc-950">Deadline signals</h2>
          <DataTable
            columns={[
              { key: "name", label: "Task" },
              { key: "assignee", label: "Owner" },
              { key: "risk", label: "Signal", render: (row) => <StatusBadge status={getTaskRisk(row)} /> },
            ]}
            rows={tasks.filter((task) => getTaskRisk(task) !== "Clear")}
          />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-950">
          <CheckCircle2 className="size-5 text-lime-600" />
          Workload balancing
        </h2>
        <DataTable
          columns={[
            { key: "name", label: "Employee" },
            { key: "position", label: "Position" },
            { key: "activeTasks", label: "Active tasks" },
            { key: "overdueTasks", label: "Overdue" },
            {
              key: "workload",
              label: "Load",
              render: (row) => <StatusBadge status={row.activeTasks >= 5 ? "At Risk" : "On Track"} />,
            },
          ]}
          rows={workloadRows}
        />
      </section>
    </div>
  );
}
