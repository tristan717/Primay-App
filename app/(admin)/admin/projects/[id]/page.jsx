import { PageHeader} from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import WorkshopHeader from "../_components/workshopHead";
import Worksapce from "../_components/workSpace";
import BackButton from "@/components/backButton";

export default async function AdminProjectDetailPage({ params }) {
  const { id } = await params;

  return (
    <div>
        <PageHeader
          eyebrow="Project Management"
          title="Project Workshop"
          description="Your workspace for creative thinking of leading the projects to success."
          actions={<BackButton />}
        />

      <WorkshopHeader id={id} />
      <Worksapce id={id} />


    </div>
  );
}
