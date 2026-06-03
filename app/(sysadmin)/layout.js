import { redirect } from "next/navigation";
import NotFound from "../not-found";
import { getOrganization } from "@/actions/organization";
import { SideNav } from "@/components/SideNav";
import { checkUser } from "@/lib/checkUser";

export default async function MainLayout({ children }) {
  const verified = await checkUser();

  if (!verified.success || !verified.data) {
    return NotFound();
  }

  const role = verified.data.role;

  if (role !== "SYSADMIN") {
    return NotFound();
  }
  if(verified.data.user_status === true){
    return NotFound()
  }

  const organization = await getOrganization();

  if (!organization.data) {
    redirect("/company-setup");
  }

  return (
    <SideNav role={role}>
      {children}
    </SideNav>
  );
}
