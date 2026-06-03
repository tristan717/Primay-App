import { DataTable, PageHeader } from "@/components/DashboardShell";
import { activityLogs } from "@/lib/dashboardData";
import ActivityTable from "./_components/activityTable";

export default function SysAdminActivityLogsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Activity Logs"
        title="Task and project history"
        description="A factual audit trail showing who changed work records, what changed, and when it happened."
      />

      <ActivityTable />
    </div>
  );
}
