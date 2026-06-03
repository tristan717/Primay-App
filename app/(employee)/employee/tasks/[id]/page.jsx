import { PageHeader, ReadonlyField, FieldGroup, StatusBadge } from "@/components/DashboardShell";
import { getTaskRisk, tasks } from "@/lib/dashboardData";

export default async function EmployeeTaskDetailPage({ params }) {
  const { id } = await params;
  const task = tasks.find((item) => item.id === id) ?? tasks[0];

  return (
    <div>
      <PageHeader
        eyebrow="My task"
        title={task.name}
        description="Task details are scoped to assigned work."
      />
      <FieldGroup title="Assigned task">
        <ReadonlyField label="Project" value={task.project} />
        <ReadonlyField label="Deadline" value={task.deadline} />
        <ReadonlyField label="Status" value={<StatusBadge status={task.status} />} />
        <ReadonlyField label="Signal" value={<StatusBadge status={getTaskRisk(task)} />} />
        <div className="md:col-span-2">
          <ReadonlyField label="Details" value={task.details} />
        </div>
      </FieldGroup>
    </div>
  );
}
