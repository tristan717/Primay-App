import { PageHeader } from "@/components/DashboardShell";
import TaskTable from "./_components/taskTable";

export default function AdminTasksPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Task Management"
        title="Tasks Table"
        description="View the tasks you have assigned at your projects. Task deadlines must stay within the selected project duration."
      />

      {/* <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FieldGroup title="Create task">
          <Input placeholder="Task name" />
          <Input placeholder="Project" />
          <Input placeholder="Assign employee" />
          <Input type="date" aria-label="Task deadline" />
          <Input placeholder="Task location (optional)" />
          <Input placeholder="Company collaborator (optional)" />
          <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Deadline validation: reject dates before project start or after project end.
          </div>
          <div className="md:col-span-2">
            <Textarea placeholder="Task details" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button className="bg-zinc-950 text-white hover:bg-zinc-800"><ClipboardPlus className="size-4" /> Save task</Button>
          </div>
        </FieldGroup>

        <section>
          <h2 className="mb-3 text-lg font-bold text-zinc-950">Task records</h2>
          <DataTable
            columns={[
              { key: "name", label: "Task" },
              { key: "project", label: "Project" },
              { key: "assignee", label: "Assigned to" },
              { key: "deadline", label: "Deadline" },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
              { key: "risk", label: "Signal", render: (row) => <StatusBadge status={getTaskRisk(row)} /> },
            ]}
            rows={tasks}
          />
        </section>
      </div> */}
      <TaskTable />
    </div>
  );
}
