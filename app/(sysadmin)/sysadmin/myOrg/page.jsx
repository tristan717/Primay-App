"use server";
import { getOrganization } from "@/actions/organization";
import { OrganizationForm } from "./_components/OrganizationForm";

export default async function SysAdminMyOrgPage() {
  const organization = await getOrganization();

  return (
    <OrganizationForm
      organization={organization.data}
      mode={organization.data ? "edit" : "setup"}
    />
  );
}
