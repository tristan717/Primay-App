"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import AxiosInstance from "@/utils/axios";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TASK_STATUS_FILTERS = {
  all: "all",
  pending: "PENDING",
  done: "DONE",
};

const TASK_STATUS_LABELS = {
  all: "All Tasks",
  PENDING: "Pending Only",
  DONE: "Done Only",
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-gray-950">{row?.fullName || label}</p>
      <p className="mt-1 text-yellow-600">Pending: {row?.pendingCount || 0}</p>
      <p className="text-lime-700">Done: {row?.doneCount || 0}</p>
      <p className="text-gray-500">Total: {row?.totalCount || 0}</p>
    </div>
  );
}

export default function EmployeeChart({ isAnimationActive = true }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [chartRows, setChartRows] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(TASK_STATUS_FILTERS.all);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoadingProjects(true);
        setError("");
        const response = await AxiosInstance.get("/project");
        
        if (response?.data?.code === 200 && response.data.success) {
          const projectsList = Array.isArray(response.data.dataProject) 
            ? response.data.dataProject 
            : [];
          setProjects(projectsList);
        } else {
          setError(response?.data?.message || "Failed to load projects.");
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects for employee chart:", error);
        setError("Unable to fetch projects. Please try again.");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchProjects();
  }, [setLoadingProjects, setProjects, setError]);

  useEffect(() => {
    async function fetchChartData() {
      if (!selectedProjectId) {
        setChartRows([]);
        setTotalTasks(0);
        setError("");
        return;
      }

      try {
        setLoadingChart(true);
        setError("");
        const response = await AxiosInstance.get(
          `/admin_employee_workload?project_id=${selectedProjectId}`
        );

        if (response?.data?.code === 200 && response.data.success) {
          console.log("response.data: ", response.data)
          setChartRows(Array.isArray(response.data.employees) ? response.data.employees : []);
          setTotalTasks(response.data.totalTasks || 0);
        } else {
          setChartRows([]);
          setTotalTasks(0);
          setError(response?.data?.message || "Failed to fetch employee task counts.");
        }
      } catch (error) {
        console.error("Error fetching employee chart data:", error);
        setChartRows([]);
        setTotalTasks(0);
        setError("Failed to fetch employee task counts.");
      } finally {
        setLoadingChart(false);
      }
    }

    fetchChartData();
  }, [selectedProjectId]);

  const selectedProjectName = useMemo(() => {
    return (
      projects.find((project) => project.project_id === selectedProjectId)?.project_name ||
      "Select a project"
    );
  }, [projects, selectedProjectId]);

  console.log("chartRows: ", chartRows)
  const chartData = useMemo(() => {
    return chartRows.map((employee) => ({
      ...employee,
      employeeName: employee.shortName || employee.fullName || "Employee",
      pendingCount: Number(employee.pendingCount || 0),
      doneCount: Number(employee.doneCount || 0),
      totalCount: Number(employee.totalCount || 0),
    }));
  }, [chartRows]);

  // Calculate filtered totals based on status filter
  const filteredTotalTasks = useMemo(() => {
    if (statusFilter === TASK_STATUS_FILTERS.all) {
      return totalTasks;
    }
    
    if (statusFilter === TASK_STATUS_FILTERS.pending) {
      return chartData.reduce((sum, emp) => sum + emp.pendingCount, 0);
    }
    
    if (statusFilter === TASK_STATUS_FILTERS.done) {
      return chartData.reduce((sum, emp) => sum + emp.doneCount, 0);
    }
    
    return totalTasks;
  }, [chartData, statusFilter, totalTasks]);

  const yDomainMax = Math.max(filteredTotalTasks, 1);

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">Employee Workload Chart</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a project to compare pending and done task counts per employee.
          </p>
        </div>

        <div className="w-full md:w-72">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Project
          </span>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
              <span className="flex flex-1 truncate text-left">
                {loadingProjects ? "Loading projects..." : selectedProjectName}
              </span>
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

          {selectedProjectId && (
            <div className="flex-1 md:w-56">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Task Status
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                  <span className="flex flex-1 text-left">
                    {TASK_STATUS_LABELS[statusFilter] || "All Tasks"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TASK_STATUS_FILTERS.all}>
                    All Tasks
                  </SelectItem>
                  <SelectItem value={TASK_STATUS_FILTERS.pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={TASK_STATUS_FILTERS.done}>
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!selectedProjectId && (
        <div className="flex h-72 items-center justify-center px-4 text-center">
          <div>
            <p className="font-medium text-gray-900">Choose a project</p>
            <p className="mt-1 text-sm text-gray-500">
              Employee task counts will appear after a project is selected.
            </p>
          </div>
        </div>
      )}

      {selectedProjectId && loadingChart && (
        <div className="flex h-72 items-center justify-center text-gray-500">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Loading chart
          </span>
        </div>
      )}

      {selectedProjectId && !loadingChart && chartData.length === 0 && (
        <div className="flex h-72 items-center justify-center px-4 text-center">
          <div>
            <p className="font-medium text-gray-900">No employee workload data</p>
            <p className="mt-1 text-sm text-gray-500">
              This project has no reflected employee task counts yet.
            </p>
          </div>
        </div>
      )}

      {selectedProjectId && !loadingChart && chartData.length > 0 && (
        <div className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-gray-900">
              Total filtered tasks: {totalTasks}
            </span>
            <span className="text-gray-500">
              Y-axis max: {yDomainMax}
            </span>
          </div>

          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 18, left: 0, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="pendingTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="doneTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65a30d" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#65a30d" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="employeeName"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  minTickGap={8}
                  tick={{ fontSize: 12, fill: "#4b5563" }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, yDomainMax]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip content={<ChartTooltip statusFilter={statusFilter} />} />
                <Legend />
                {(statusFilter === TASK_STATUS_FILTERS.all || 
                  statusFilter === TASK_STATUS_FILTERS.pending) && (
                  <Area
                    type="monotone"
                    dataKey="pendingCount"
                    name="Pending"
                    stroke="#eab308"
                    strokeWidth={2}
                    fill="url(#pendingTasks)"
                    fillOpacity={1}
                    isAnimationActive={isAnimationActive}
                  />
                )}
                {(statusFilter === TASK_STATUS_FILTERS.all || 
                  statusFilter === TASK_STATUS_FILTERS.done) && (
                  <Area
                    type="monotone"
                    dataKey="doneCount"
                    name="Done"
                    stroke="#65a30d"
                    strokeWidth={2}
                    fill="url(#doneTasks)"
                    fillOpacity={1}
                    isAnimationActive={isAnimationActive}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
