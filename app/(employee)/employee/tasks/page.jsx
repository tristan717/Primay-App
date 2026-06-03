import { DataTable, PageHeader, StatusBadge } from "@/components/DashboardShell";
import { getTaskRisk, tasks } from "@/lib/dashboardData";
import TaskTable from "./_components/taskTable";

export default function EmployeeTasksPage() {
  const assignedTasks = tasks.filter((task) => task.assignee === "Paolo Reyes");

  return (
    <div>
      <PageHeader
        eyebrow="My tasks"
        title="tasks Table"
        description="Manage your assigned tasks here."
      />

      <TaskTable />
    </div>
  );
}
