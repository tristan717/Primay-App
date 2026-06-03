import { PageHeader, ReadonlyField, FieldGroup } from "@/components/DashboardShell";
import { activityLogs } from "@/lib/dashboardData";

export default async function SysAdminActivityLogDetailPage({ params }) {
  const { id } = await params;
  const log = activityLogs.find((item) => item.id === id) ?? activityLogs[0];

  return (
    <div>
      <PageHeader
        eyebrow="Activity detail"
        title={log.target}
        description="Detailed audit entry for project and task history."
      />
      <FieldGroup title="Log record">
        <ReadonlyField label="Actor" value={log.actor} />
        <ReadonlyField label="Area" value={log.area} />
        <ReadonlyField label="Action" value={log.action} />
        <ReadonlyField label="Timestamp" value={log.timestamp} />
      </FieldGroup>
    </div>
  );
}
