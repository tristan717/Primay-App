"use client";
import { PageHeader, ReadonlyField, FieldGroup, StatusBadge } from "@/components/DashboardShell";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import AxiosInstance from "@/utils/axios";
import { CircleCheck, ClipboardClock, ClipboardList, FolderKanban } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const TASK_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "DONE", label: "Done" },
];

const READ_STATUSES = [
  { value: "all", label: "All Read Statuses" },
  { value: "true", label: "Read" },
  { value: "false", label: "Unread" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isTruthy(value) {
  return value === true || normalizeText(value) === "true";
}

function getStatusBadgeColor(status) {
  if (status === "DONE") return "p-1 rounded-md border-lime-700 border-2 bg-lime-100 text-lime-800";
  if (status === "PENDING") return "p-1 rounded-md border-yellow-700 border-2 bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
}

function getReadStatusBadgeColor(isRead) {
  return isTruthy(isRead) 
    ? "p-1 rounded-md border-lime-800 border-2 bg-lime-100 text-lime-800" 
    : "p-1 rounded-md border-mist-600 border-2 bg-mist-200 text-mist-600";
}

export default function EmployeeDetails({ id }) {
    const [employeeInfo, setEmployeeInfo] = useState({})
    const [projectArr, setProjectArr] = useState([])
    const [taskArr, setTaskArr] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const [taskStatusFilter, setTaskStatusFilter] = useState("all");
    const [readStatusFilter, setReadStatusFilter] = useState("all");
    const [deadlineFrom, setDeadlineFrom] = useState("");
    const [deadlineTo, setDeadlineTo] = useState("");
    const [assignedFrom, setAssignedFrom] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [projectTaskCounts, setProjectTaskCounts] = useState({});
    const [loadingContribution, setLoadingContribution] = useState(false);

    useEffect(() => {
    async function fetchEmployeeInfo(){
        const response = await AxiosInstance.get(`/my_employee?id=${id}`)
        if(response){
            if(response.data){
                const res = response.data
                if(res.code === 200 && res.success === true){
                    const payloads = res.data
                    setEmployeeInfo(payloads.employeeData)
                    setProjectArr(payloads.projects)
                    setTaskArr(payloads.tasks)
                }
            }
        }
    }
    fetchEmployeeInfo();
    },[id, setEmployeeInfo, setProjectArr, setTaskArr])

    useEffect(() => {
        if (projectArr.length === 0) return;

        async function fetchProjectTotalTasks() {
            try {
            setLoadingContribution(true);
            const projectIds = projectArr.map(p => p.project_id).join(",");
            const response = await AxiosInstance.get(
                `/my_employee/contribution?project_ids=${projectIds}`
            );

            if (response?.data?.code === 200 && response.data.success) {
                setProjectTaskCounts(response.data.taskCounts || {});
            }
            } catch (error) {
            console.error("Error fetching project task counts:", error);
            } finally {
            setLoadingContribution(false);
            }
        }

        fetchProjectTotalTasks();
    }, [projectArr]);

    console.log("employeeInfo: ", employeeInfo)
    console.log("projectArr: ", projectArr)
    console.log("taskArr: ", taskArr)

    const workloadCards = [
        {
            id: 1,
            title: "Total Tasks",
            count: taskArr.length,
            icon: <ClipboardList className="lg:h-7 lg:w-7 md:h-4 md:w-4 h-7 w-7" />,
            iconColor: "text-purple-500",
            desc: "Total tasks that have been assigned"
        },
        {
            id: 2,
            title: "Total Projects",
            count: projectArr.length,
            icon: <FolderKanban className="lg:h-7 lg:w-7 md:h-4 md:w-4 h-7 w-7" />,
            iconColor: "text-blue-500",
            desc: "Total affiliated projects"
        },
        {
            id: 3,
            title: "Pending Tasks", 
            count: taskArr.filter(task => task.task_status === "PENDING").length,
            icon: <ClipboardClock className="lg:h-7 lg:w-7 md:h-4 md:w-4 h-7 w-7" />,
            iconColor: "text-yellow-500",
            desc: "Total pending acknowledged tasks"
        },
        {
            id: 4,
            title: "Completed Tasks",
            count: taskArr.filter(task => task.task_status === "DONE").length,
            icon: <CircleCheck className="lg:h-7 lg:w-7 md:h-4 md:w-4 h-7 w-7" />,
            iconColor: "text-lime-500",
            desc: "Total submitted tasks"
        }
    ]

    const filteredTasks = useMemo(() => {
      if (!Array.isArray(taskArr)) return [];

      return taskArr.filter((task) => {
        // Search filter
        const searchLower = normalizeText(searchQuery);
        const matchesSearch =
          normalizeText(task.task_name).includes(searchLower) ||
          normalizeText(task.project_name).includes(searchLower);

        if (searchQuery && !matchesSearch) return false;

        // Task status filter
        if (taskStatusFilter !== "all") {
          if (normalizeText(task.task_status) !== normalizeText(taskStatusFilter)) {
            return false;
          }
        }

        // Read status filter
        if (readStatusFilter !== "all") {
          const isRead = isTruthy(task.received_employee);
          const filterIsRead = readStatusFilter === "true";
          if (isRead !== filterIsRead) return false;
        }

        // Deadline range filter
        if (deadlineFrom || deadlineTo) {
          const taskDeadline = task.deadline ? new Date(task.deadline) : null;
          if (taskDeadline) {
            if (deadlineFrom) {
              const fromDate = new Date(`${deadlineFrom}T00:00:00`);
              if (taskDeadline < fromDate) return false;
            }
            if (deadlineTo) {
              const toDate = new Date(`${deadlineTo}T23:59:59`);
              if (taskDeadline > toDate) return false;
            }
          }
        }

        // Assigned date range filter
        if (assignedFrom || assignedTo) {
          const taskAssignedDate = task.created_at ? new Date(task.created_at) : null;
          if (taskAssignedDate) {
            if (assignedFrom) {
              const fromDate = new Date(`${assignedFrom}T00:00:00`);
              if (taskAssignedDate < fromDate) return false;
            }
            if (assignedTo) {
              const toDate = new Date(`${assignedTo}T23:59:59`);
              if (taskAssignedDate > toDate) return false;
            }
          }
        }

        return true;
      });
    }, [
      taskArr,
      searchQuery,
      taskStatusFilter,
      readStatusFilter,
      deadlineFrom,
      deadlineTo,
      assignedFrom,
      assignedTo,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
    const paginatedTasks = useMemo(() => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filteredTasks.slice(startIndex, endIndex);
    }, [filteredTasks, currentPage, pageSize]);


    const handleFilterChange = (setter, value) => {
      setter(value);
      setCurrentPage(1);
    };

    const handlePreviousPage = () => {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };


    const handleClearFilters = () => {
        setSearchQuery("");
        setTaskStatusFilter("all");
        setReadStatusFilter("all");
        setDeadlineFrom("");
        setDeadlineTo("");
        setAssignedFrom("");
        setAssignedTo("");
        setCurrentPage(1);
    };


    const projectContributions = useMemo(() => {
    if (!Array.isArray(projectArr) || !Array.isArray(taskArr)) return [];

    return projectArr.map((project) => {
        // Filter tasks for this employee in this project
        const employeeProjectTasks = taskArr.filter(
        (task) => task.project_id === project.project_id
        );

        const employeeCompletedTasks = employeeProjectTasks.filter(
        (task) => task.task_status === "DONE"
        ).length;

        const employeePendingTasks = employeeProjectTasks.filter(
        (task) => task.task_status === "PENDING"
        ).length;

        // Get total project tasks
        const projectStats = projectTaskCounts[project.project_id] || {
        totalTasks: 0,
        completedTasks: 0,
        };

        // Calculate contribution: (Employee's completed tasks / Total project tasks) * 100
        const contributionPercentage =
        projectStats.totalTasks > 0
            ? Math.round((employeeCompletedTasks / projectStats.totalTasks) * 100)
            : 0;

        return {
        project_id: project.project_id,
        project_name: project.project_name,
        employeeTotalTasks: employeeProjectTasks.length,
        employeeCompletedTasks,
        employeePendingTasks,
        projectTotalTasks: projectStats.totalTasks,
        projectCompletedTasks: projectStats.completedTasks,
        contributionPercentage, // Real contribution to project
        status: project.status,
        priority: project.priority,
        };
    });
    }, [projectArr, taskArr, projectTaskCounts]);


    
    return (
        <div>

            <div className="flex flex-row w-full overflow-x-auto gap-4">
                {workloadCards.map((card) => (
                    <Card key={card.id} className="w-72 md:w-full py-4 rounded-md gap-1 shrink-0 md:shrink">
                        <CardHeader className="px-4">
                            <CardTitle className="flex whitespace-nowrap capitalize items-center text-2xl md:text-sm lg:text-2xl ">
                                <label className="font-bold tracking-normal lg:tracking-wider">{card.title}</label>
                                <span className={`ml-2 ${card.iconColor}`}>{card.icon}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4">
                            <p className="text-4xl font-bold">{card.count}</p>
                        </CardContent>
                        <CardFooter className="px-4">
                            <p className="text-sm text-muted-foreground whitespace-nowrap">{card.desc}</p>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            
            <div className="mt-5">
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2">
                    <div className="lg:col-span-2">
                          {/* Filters Section */}
                          <div className="mb-4 space-y-4 rounded-lg p-4">
                            <div className="grid gap-4 md:grid-cols-2">


                              {/* Task Status Filter */}
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Task Status
                                </label>
                                <Select
                                  value={taskStatusFilter}
                                  onValueChange={(value) => handleFilterChange(setTaskStatusFilter, value)}
                                >
                                  <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TASK_STATUSES.map((status) => (
                                      <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Read Status Filter */}
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Read Status
                                </label>
                                <Select
                                  value={readStatusFilter}
                                  onValueChange={(value) => handleFilterChange(setReadStatusFilter, value)}
                                >
                                  <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {READ_STATUSES.map((status) => (
                                      <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Date Range Filters */}
                            <div className="grid gap-4 md:grid-cols-4">
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Deadline From
                                </label>
                                <Input
                                  type="date"
                                  value={deadlineFrom}
                                  onChange={(e) => handleFilterChange(setDeadlineFrom, e.target.value)}
                                  className="h-10"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Deadline To
                                </label>
                                <Input
                                  type="date"
                                  value={deadlineTo}
                                  onChange={(e) => handleFilterChange(setDeadlineTo, e.target.value)}
                                  className="h-10"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Assigned From
                                </label>
                                <Input
                                  type="date"
                                  value={assignedFrom}
                                  onChange={(e) => handleFilterChange(setAssignedFrom, e.target.value)}
                                  className="h-10"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Assigned To
                                </label>
                                <Input
                                  type="date"
                                  value={assignedTo}
                                  onChange={(e) => handleFilterChange(setAssignedTo, e.target.value)}
                                  className="h-10"
                                />
                              </div>
                            </div>

                              {/* Search Filter */}
                              <div>
                                <div className="flex flex-row relative">
                                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                  <Input
                                    placeholder="Search Task name or Project"
                                    value={searchQuery}
                                    onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                                    className="pl-9"
                                  />
                                

                                {searchQuery && (
                                  <Button
                                    // variant="outline"
                                    size="icon"
                                    className="border border-red-500 bg-white/0 text-red-500 hover:bg-white/0"
                                    onClick={() => handleFilterChange(setSearchQuery, "")}
                                  >
                                    <X className="size-4" />
                                  </Button>
                                )}
                                </div>
                              </div>
                          </div>

                          {/* Table */}
                          {paginatedTasks.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader className="bg-gray-50">
                                  <TableRow>
                                    <TableHead className="font-semibold">Task Name</TableHead>
                                    <TableHead className="font-semibold">Project</TableHead>
                                    <TableHead className="font-semibold">Deadline</TableHead>
                                    <TableHead className="font-semibold">Task Status</TableHead>
                                    <TableHead className="font-semibold">Read Status</TableHead>
                                    <TableHead className="font-semibold">Assigned Date</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {paginatedTasks.map((task) => (
                                    <TableRow key={task.task_id} className="hover:bg-gray-50">
                                      <TableCell className="font-medium">{task.task_name || "N/A"}</TableCell>
                                      <TableCell>{task.project_name || "N/A"}</TableCell>
                                      <TableCell>{formatDate(task.deadline)}</TableCell>
                                      <TableCell>
                                        <Badge className={getStatusBadgeColor(task.task_status)}>
                                          {task.task_status || "Unknown"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={getReadStatusBadgeColor(task.received_employee)}>
                                          {isTruthy(task.received_employee) ? "Read" : "Unread"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{formatDate(task.created_at)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="flex h-40 items-center justify-center">
                              <p className="text-gray-500">No tasks found matching your filters.</p>
                            </div>
                          )}

                          {/* Pagination */}
                          <div className="mt-6 flex items-center justify-between">
                            <Button
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-lg border-lime-500 text-lime-500"
                            >
                              <ChevronLeft className="size-4" />
                              Previous
                            </Button>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                              </span>
                            </div>

                            <Button
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-lg border-lime-500 text-lime-500"
                            >
                              Next
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        
                    </div>








                    <div className="md:mt-4 lg:mt-0">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-gray-950">
                            Project Contribution
                        </h2>

                        {projectContributions.length > 0 ? (
                            <div className="space-y-3">
                            {projectContributions.map((contrib) => (
                                <div
                                key={contrib.project_id}
                                className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                >
                                <div className="mb-2 flex items-start justify-between">
                                    <div className="flex-1">
                                    <p className="font-medium text-gray-900">{contrib.project_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {contrib.employeeCompletedTasks}/{contrib.projectTotalTasks} tasks • {contrib.contributionPercentage}% contribution
                                    </p>
                                    </div>
                                    <Badge className="ml-2 whitespace-nowrap">
                                    {contrib.contributionPercentage}%
                                    </Badge>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2 mb-2">
                                    <Progress value={contrib.contributionPercentage} className="h-2" />
                                </div>

                                {/* Stats */}
                                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="rounded bg-blue-50 p-1.5">
                                    <p className="text-blue-700 font-semibold">{contrib.employeeTotalTasks}</p>
                                    <p className="text-blue-600">Employee Tasks</p>
                                    </div>
                                    <div className="rounded bg-lime-50 p-1.5">
                                    <p className="text-lime-700 font-semibold">{contrib.employeeCompletedTasks}</p>
                                    <p className="text-lime-600">Completed</p>
                                    </div>
                                    <div className="rounded bg-purple-50 p-1.5">
                                    <p className="text-purple-700 font-semibold">{contrib.projectTotalTasks}</p>
                                    <p className="text-purple-600">Project Total</p>
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>
                        ) : (
                            <div className="flex h-32 items-center justify-center text-center">
                            <p className="text-gray-500">
                                {loadingContribution ? "Loading contributions..." : "No project contributions yet"}
                            </p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
