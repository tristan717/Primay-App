import { DataTable, PageHeader, StatusBadge } from "@/components/DashboardShell";
import { projects, tasks } from "@/lib/dashboardData";
import EmployeeProjectTable from "./_components/employee_projectTable";

export default function EmployeeProjectsPage() {
  const assignedProjectNames = new Set(
    tasks.filter((task) => task.assignee === "Paolo Reyes").map((task) => task.project)
  );
  const assignedProjects = projects.filter((project) => assignedProjectNames.has(project.name));

  return (
    <div>
      <PageHeader
        eyebrow="Assigned projects"
        title="Project context"
        description="View your affiliated projects here."
      />

      <EmployeeProjectTable /> 
    </div>
  );
}
