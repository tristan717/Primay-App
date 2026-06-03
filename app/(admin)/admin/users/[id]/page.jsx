import { PageHeader } from "@/components/DashboardShell";
import { users } from "@/lib/dashboardData";
import EmployeeDetails from "../_components/employeeDetails";
import { getEmployeeDetails } from "@/actions/getEmployee";
import BackButton from "@/components/backButton";

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;
  const user = users.find((item) => item.id === id) ?? users[0];

  const employee = await getEmployeeDetails(id)

  return (
    <div>

        <PageHeader
          eyebrow="Employee detail"
          title={`${employee.data.f_name} ${employee.data.l_name}`}
          description="Review workload and employee profile data visible to admins."
          actions={<BackButton />}
        />

      <EmployeeDetails id={id} />
    </div>
  );
}
