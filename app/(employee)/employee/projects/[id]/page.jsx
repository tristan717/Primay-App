import { PageHeader, ReadonlyField, FieldGroup, StatusBadge } from "@/components/DashboardShell";
import { projects } from "@/lib/dashboardData";

export default async function EmployeeProjectDetailPage({ params }) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id) ?? projects[0];

  return (
    <div>
      <PageHeader
        eyebrow="Assigned project"
        title={project.name}
        description="Project context for assigned employees."
      />
      <FieldGroup title="Project context">
        <ReadonlyField label="Lead" value={project.lead} />
        <ReadonlyField label="Status" value={<StatusBadge status={project.status} />} />
        <ReadonlyField label="Duration" value={`${project.startDate} to ${project.endDate}`} />
        <ReadonlyField label="Progress" value={`${project.progress}%`} />
        <div className="md:col-span-2">
          <ReadonlyField label="Details" value={project.details} />
        </div>
      </FieldGroup>
    </div>
  );
}
