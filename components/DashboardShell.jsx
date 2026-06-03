import { getStatusTone } from "@/lib/dashboardData";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase text-lime-600">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-black text-zinc-950 md:text-4xl capitalize">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm text-zinc-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatGrid({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-md border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-3xl font-black text-zinc-950">{stat.value}</span>
            {stat.icon && <stat.icon className="size-6 text-lime-600" />}
          </div>
          {stat.caption && <p className="mt-2 text-xs text-zinc-500">{stat.caption}</p>}
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={cn("inline-flex rounded-md border px-2 py-1 text-xs font-semibold", getStatusTone(status))}>
      {status}
    </span>
  );
}

export function DataTable({ columns, rows, emptyText = "No records found." }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-bold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length ? rows.map((row) => (
              <tr key={row.id} className="align-top">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-zinc-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FieldGroup({ title, children }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5">
      <h2 className="text-base font-bold text-zinc-950">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

export function ReadonlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}
