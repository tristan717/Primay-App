"use client";

import AxiosInstance from "@/utils/axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Ellipsis,
  Eye,
  Link,
  Loader2,
  Search,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const SORTABLE_COLUMNS = [
  { key: "task_name", label: "Task Name" },
  { key: "employee_name", label: "Assigned To" },
  { key: "deadline", label: "Deadline", type: "date" },
  { key: "created_at", label: "Created At", type: "date" },
  // { key: "updated_at", label: "Updated At", type: "date" },
];

const emptyFilters = {
  search: "",
  taskStatus: "all",
  acknowledged: "all",
  deadlineFrom: "",
  deadlineTo: "",
  createdFrom: "",
  createdTo: "",
};

const acknowledgedFilterLabels = {
  all: "All",
  true: "Acknowledged",
  false: "Not Yet Received",
};

function formatDate(value, includeTime = false) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toDateValue(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinRange(value, from, to) {
  if (!from && !to) return true;

  const date = toDateValue(value);
  if (!date) return false;

  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (date < start) return false;
  }

  if (to) {
    const end = new Date(`${to}T23:59:59`);
    if (date > end) return false;
  }

  return true;
}

function getAcknowledgedLabel(value) {
  return isTruthy(value) ? "Acknowledged" : "Pending";
}

function SortIcon({ active, direction }) {
  if (active && direction === "asc") {
    return <ArrowUpWideNarrow className="ml-1 size-4 text-lime-600" />;
  }

  if (active && direction === "desc") {
    return <ArrowDownNarrowWide className="ml-1 size-4 text-lime-600" />;
  }

  return <ChevronsUpDown className="ml-1 size-4 text-gray-400" />;
}

function DetailItem({ label, value, wide = false }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-1 wrap-break-word text-sm text-gray-900">{value || "Not set"}</p>
    </div>
  );
}

function formatBoolean(value) {
  if (isTruthy(value)) return "Yes";
  if (isFalsy(value)) return "No";
  return "Not set";
}

function isTruthy(value) {
  return value === true || normalizeText(value) === "true";
}

function isFalsy(value) {
  return value === false || normalizeText(value) === "false";
}

export default function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const route = useRouter();

  // useEffect(() => {
    const fetchTasks = useCallback(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await AxiosInstance.get("/all_task");
        if (response) {
          if (response.data) {
            const res = response.data;
            if (res.code === 200 && res.success) {
              console.log("Tasks fetched successfully:", res.tasks);
              setTasks(Array.isArray(res.tasks) ? res.tasks : []);
            } else {
              setTasks([]);
              setError(res.message || "Failed to fetch tasks.");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Error fetching tasks.");
      } finally {
        setLoading(false);
      }
    }, []);
    // fetchTasks();
  // }, []);
    useEffect(() => {
      async function populators(){
          await fetchTasks();
      }
      populators();
    }, [fetchTasks]);
    // const fetchTasks = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const response = await AxiosInstance.get(`/task?project_id=${id}`);
    //         if (response?.data?.success) {
    //             setTasks(response.data.tasks);
    //             setCurrentPage(1);
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch tasks:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [id]);

  const filteredTasks = useMemo(() => {
    const search = normalizeText(filters.search);

    return tasks.filter((task) => {
      const matchesSearch =
        !search ||
        [task.task_name, task.employee_name, task.project_name]
          .map(normalizeText)
          .some((value) => value.includes(search));

      const matchesStatus =
        normalizeText(filters.taskStatus) === "all" ||
        normalizeText(task.task_status) === normalizeText(filters.taskStatus);

      const matchesAcknowledged =
        normalizeText(filters.acknowledged) === "all" ||
        String(isTruthy(task.received_employee)) === filters.acknowledged;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAcknowledged &&
        isWithinRange(task.deadline, filters.deadlineFrom, filters.deadlineTo) &&
        isWithinRange(task.created_at, filters.createdFrom, filters.createdTo)
      );
    });
  }, [tasks, filters]);

  const sortedTasks = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === "none") return filteredTasks;

    const column = SORTABLE_COLUMNS.find((item) => item.key === sortConfig.key);

    return [...filteredTasks].sort((a, b) => {
      let left = a[sortConfig.key];
      let right = b[sortConfig.key];

      if (column?.type === "date") {
        left = toDateValue(left)?.getTime() ?? 0;
        right = toDateValue(right)?.getTime() ?? 0;
      } else {
        left = normalizeText(left);
        right = normalizeText(right);
      }

      if (left < right) return sortConfig.direction === "asc" ? -1 : 1;
      if (left > right) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, sortConfig]);

  const pageCount = Math.max(1, Math.ceil(sortedTasks.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + pageSize);


  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  const updatePageSize = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }

      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key: "", direction: "none" };
      return { key, direction: "asc" };
    });
  };

  const openDetails = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const openArchive = (task) => {
    setSelectedTask(task);
    setArchiveOpen(true);
  };

  const handleArchive = async () => {
    if (!selectedTask?.task_id) return;

    try {
      setArchiveLoading(true);
      await AxiosInstance.put(`/task/archive`, {id: selectedTask.task_id} );
      // setTasks((prev) => prev.filter((task) => task.task_id !== selectedTask.task_id));
      fetchTasks();
      setArchiveOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error archiving task:", error);
      setError("Error archiving task.");
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <div>
      <div className="">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="relative block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Search
                  </span>
                  <Search className="pointer-events-none absolute bottom-2.5 left-3 size-4 text-gray-400" />
                  <Input
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                    placeholder="Task, employee, project"
                    className="h-10 pl-9"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Task Status
                  </span>
                  <Select
                    value={filters.taskStatus}
                    onValueChange={(value) => updateFilter("taskStatus", value)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="PENDING" >Pending</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Acknowledged
                  </span>
                  <Select
                    value={filters.acknowledged}
                    onValueChange={(value) => updateFilter("acknowledged", value)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                      <span className="flex flex-1 text-left">
                        {acknowledgedFilterLabels[filters.acknowledged] || "All"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Acknowledged</SelectItem>
                      <SelectItem value="false">Not Yet Received</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-auto h-10"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <CalendarDays className="size-4" />
                  Deadline Range
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={filters.deadlineFrom}
                    onChange={(event) => updateFilter("deadlineFrom", event.target.value)}
                  />
                  <Input
                    type="date"
                    value={filters.deadlineTo}
                    onChange={(event) => updateFilter("deadlineTo", event.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <CalendarDays className="size-4" />
                  Created At Range
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(event) => updateFilter("createdFrom", event.target.value)}
                  />
                  <Input
                    type="date"
                    value={filters.createdTo}
                    onChange={(event) => updateFilter("createdTo", event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>
                Full information for the selected task record.
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="grid gap-4 rounded-md border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
                <DetailItem label="Task ID" value={selectedTask.task_id} />
                <DetailItem label="Project ID" value={selectedTask.project_id} />
                <DetailItem label="Task Name" value={selectedTask.task_name} />
                <DetailItem label="Task Status" value={selectedTask.task_status} />
                <DetailItem label="Assigned To" value={selectedTask.employee_name} />
                <DetailItem label="Employee User ID" value={selectedTask.user_id_employee} />
                <DetailItem label="Project" value={selectedTask.project_name} />
                <DetailItem label="Creator" value={selectedTask.creator_name} />
                <DetailItem label="Created By" value={selectedTask.created_by} />
                <DetailItem
                  label="Acknowledged"
                  value={getAcknowledgedLabel(selectedTask.received_employee)}
                />
                <DetailItem
                  label="Received Admin"
                  value={formatBoolean(selectedTask.received_admin)}
                />
                <DetailItem
                  label="Archive Status"
                  value={formatBoolean(selectedTask.archive_status)}
                />
                <DetailItem label="Deadline" value={formatDate(selectedTask.deadline, true)} />
                <DetailItem label="Created At" value={formatDate(selectedTask.created_at, true)} />
                <DetailItem label="Updated At" value={formatDate(selectedTask.updated_at, true)} />
                <DetailItem label="Location" value={selectedTask.task_loc} wide />
                <DetailItem
                  label="Task Details"
                  value={selectedTask.task_details || selectedTask.task_detail}
                  wide
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive Task</DialogTitle>
              <DialogDescription>
                This will remove the task from the active admin task list.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
              Archive{" "}
              <span className="font-semibold">{selectedTask?.task_name || "this task"}</span>?
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setArchiveOpen(false)}
                disabled={archiveLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleArchive}
                disabled={archiveLoading}
              >
                {archiveLoading && <Loader2 className="size-4 animate-spin" />}
                Archive Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-5 overflow-x-auto">
        <Table className="px-3">
          <TableHeader>
            <TableRow className="bg-mist-500/20 hover:bg-mist-500/20">
              {SORTABLE_COLUMNS.slice(0, 2).map((column) => (
                <TableHead
                  key={column.key}
                  className="cursor-pointer select-none whitespace-nowrap text-black"
                  onClick={() => handleSort(column.key)}
                >
                  <span className="flex items-center">
                    {column.label}
                    <SortIcon
                      active={sortConfig.key === column.key}
                      direction={sortConfig.direction}
                    />
                  </span>
                </TableHead>
              ))}
              <TableHead className="whitespace-nowrap text-black text-center">Task Status</TableHead>
              <TableHead
                className="cursor-pointer select-none   whitespace-nowrap text-black"
                onClick={() => handleSort("deadline")}
              >
                <span className="flex items-center">
                  Deadline
                  <SortIcon
                    active={sortConfig.key === "deadline"}
                    direction={sortConfig.direction}
                  />
                </span>
              </TableHead>
              <TableHead className="w-[35%] min-w-75 whitespace-nowrap text-black text-center">Project</TableHead>
              <TableHead className="whitespace-nowrap text-black text-center">Acknowledged</TableHead>
              {SORTABLE_COLUMNS.slice(3).map((column) => (
                <TableHead
                  key={column.key}
                  className="cursor-pointer select-none whitespace-nowrap text-black"
                  onClick={() => handleSort(column.key)}
                >
                  <span className="flex items-center">
                    {column.label}
                    <SortIcon
                      active={sortConfig.key === column.key}
                      direction={sortConfig.direction}
                    />
                  </span>
                </TableHead>
              ))}
              <TableHead className="whitespace-nowrap text-center text-black">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white/50">
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading tasks
                  </span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              paginatedTasks.map((task) => (
                <TableRow key={task.task_id} className="hover:bg-gray-50">
                  <TableCell className="min-w-44 font-medium text-gray-950">
                    {task.task_name}
                  </TableCell>
                  <TableCell className="min-w-40">{task.employee_name || "Not set"}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={
                      `${task.task_status}` === "DONE"
                        ? `px-2 py-1 font-bold rounded-md bg-lime-50 text-lime-700 border-2 border-lime-200`
                        : `px-2 py-1 font-bold rounded-md bg-yellow-100 text-yellow-600 border-2 border-yellow-200`
                      }>
                      {task.task_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-36">{formatDate(task.deadline)}</TableCell>
                  <TableCell className="w-[35%] min-w-75 text-center">{task.project_name}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        isTruthy(task.received_employee)
                          ? "rounded-md bg-lime-50 px-2 py-1 text-lime-700 border-2 border-lime-200"
                          : "rounded-md bg-yellow-100 px-2 py-1 text-yellow-600 border-2 border-yellow-200"
                      }
                    >
                      {getAcknowledgedLabel(task.received_employee)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-40">
                    {formatDate(task.created_at, true)}
                  </TableCell>
                  <TableCell className="min-w-32 text-center">
                    <div className="flex justify-center gap-2">
                      <Popover>
                        <PopoverTrigger className="w-5 h-5 cursor-pointer mx-auto">
                          <span><Ellipsis /></span>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto rounded-lg bg-white/30 backdrop-blur-3xl">
                          <div className="flex flex-col p-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(task)}
                            className="hover:bg-lime-300/40 justify-start rounded-t-lg tracking-normal gap-2"
                            aria-label="View task details"
                          >
                            <Eye className="size-4" />
                            View Details
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="hover:bg-lime-300/40 justify-start text-red-600 tracking-normal gap-2"
                            onClick={() => openArchive(task)}
                            size="sm"
                            aria-label="Archive task"
                          >
                            <Archive className="size-4" />
                            Archive Task
                          </Button>
                          <Button
                            type="button" 
                            variant="outline"
                            className="hover:bg-lime-300/40 rounded-b-lg justify-start text-blue-600 tracking-normal gap-2"
                            onClick={() => route.push(`/admin/projects/${task.project_id}`)}
                            size="sm"
                            aria-label="Archive task"
                          >
                            <Link className="size-4" />
                            Go To Project
                          </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {!loading && paginatedTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="mx-auto max-w-sm">
                    <p className="font-medium text-gray-900">No tasks found</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting the search, date range, or dropdown filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">
            {sortedTasks.length ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900">
            {Math.min(startIndex + pageSize, sortedTasks.length)}
          </span>{" "}
          of <span className="font-medium text-gray-900">{sortedTasks.length}</span>{" "}
          tasks
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={String(pageSize)}
            onValueChange={updatePageSize}
          >
            <SelectTrigger className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 sm:w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label="Previous page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <span className="min-w-24 text-center text-sm text-gray-600">
              Page {safePage} of {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={safePage >= pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              aria-label="Next page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
