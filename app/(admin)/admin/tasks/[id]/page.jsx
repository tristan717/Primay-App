import { PageHeader, ReadonlyField, FieldGroup, StatusBadge } from "@/components/DashboardShell";
import { getTaskRisk, tasks } from "@/lib/dashboardData";

export default async function AdminTaskDetailPage({ params }) {
  const { id } = await params;
  const task = tasks.find((item) => item.id === id) ?? tasks[0];

  return (
    <div>
      <PageHeader
        eyebrow="Task detail"
        title={task.name}
        description="Review assigned employee, deadline, status, and risk signal."
      />
      <FieldGroup title="Task record">
        <ReadonlyField label="Project" value={task.project} />
        <ReadonlyField label="Assignee" value={task.assignee} />
        <ReadonlyField label="Deadline" value={task.deadline} />
        <ReadonlyField label="Status" value={<StatusBadge status={task.status} />} />
        <ReadonlyField label="Priority" value={task.priority} />
        <ReadonlyField label="Signal" value={<StatusBadge status={getTaskRisk(task)} />} />
        <div className="md:col-span-2">
          <ReadonlyField label="Details" value={task.details} />
        </div>
      </FieldGroup>
    </div>
  );
}
