import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, FieldGroup, PageHeader, StatusBadge } from "@/components/DashboardShell";
import { users } from "@/lib/dashboardData";
import UserTable from "./_components/userTable";

export default function SysAdminUsersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="User management"
        title="Create, update, ban, and view users"
        description="Sysadmins control role assignment and account status while keeping user actions auditable."
        
      />

      <UserTable />
    </div>
  );
}
