import { redirect } from "next/navigation";
import NotFound from "@/app/not-found";
import { getOrganization } from "@/actions/organization";
import { checkUser } from "@/lib/checkUser";
import { OrganizationForm } from "@/components/OrganizationForm";

export default async function CompanySetupPage() {
  const verified = await checkUser();

  if (!verified.success || !verified.data) {
    return NotFound();
  }

  if (verified.data?.role !== "SYSADMIN") {
    return NotFound();
  }

  const organization = await getOrganization();
  
  if(organization.code === 200 && organization.success===true){
    if (organization.data) {
      redirect("/sysadmin");
    }

  }

  if(organization.code === 201 && organization.success=== true){
    return (
      <main className="min-h-screen bg-mist-100 px-4 py-24 md:px-8">
        <OrganizationForm mode="setup" />
      </main>
    );
  }
}
