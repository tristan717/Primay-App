import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup, PageHeader, ReadonlyField } from "@/components/DashboardShell";
import { company } from "@/lib/dashboardData";

export default function AdminMyOrgPage() {
  return (
    <div>
      <PageHeader
        eyebrow="My organization"
        title="Company profile"
        description="Reference company details used in project and task records."
        actions={""}
      />
      <FieldGroup title="Company details">
        <ReadonlyField label="Company" value={company.name} />
        <ReadonlyField label="Industry" value={company.industry} />
        <ReadonlyField label="Email" value={company.email} />
        <ReadonlyField label="Phone" value={company.phone} />
        <div className="md:col-span-2">
          <ReadonlyField label="Address" value={company.address} />
        </div>
      </FieldGroup>
    </div>
  );
}
