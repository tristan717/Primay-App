"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AxiosInstance from "@/utils/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Ellipsis, Eye, FileInput, MailOpen, Search, X, Upload, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TASK_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "DONE", label: "Done" },
];

const ACKNOWLEDGE_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "true", label: "Read" },
  { value: "false", label: "Not Read" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isTruthy(value) {
  return value === true || normalizeText(value) === "true";
}

function getAcknowledgeBadgeColor(isRead) {
  return isTruthy(isRead)
    ? "p-1 rounded-md border-lime-800 border-2 bg-lime-100 text-lime-800"
    : "p-1 rounded-md border-mist-600 border-2 bg-mist-200 text-mist-600";
}

function getFilterLabel(value, optionsArray) {
  const option = optionsArray.find(opt => opt.value === value);
  return option ? option.label : value;
}


export default function TaskTable() {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [taskStatusFilter, setTaskStatusFilter] = useState("all");
    const [acknowledgeFilter, setAcknowledgeFilter] = useState("all");
    const [deadlineFrom, setDeadlineFrom] = useState("");
    const [deadlineTo, setDeadlineTo] = useState("");
    const [assignedFrom, setAssignedFrom] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    // Modal states
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const fetchTasks = async () => {
      const response = await AxiosInstance.get("/employee/tasks");
      console.log("response: ", response);
      if (response?.data?.success && response.data.code === 200) {
        setTasks(response.data.tasks);
      }
    };

    useEffect(() => {
      async function loadTasks() {
        await fetchTasks();
      }
      loadTasks();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "Invalid Date";
        }
    };

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    return tasks.filter((task) => {
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

      // Acknowledge filter
      if (acknowledgeFilter !== "all") {
        const isRead = isTruthy(task.received_employee);
        const filterIsRead = acknowledgeFilter === "true";
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
  }, [tasks, searchQuery, taskStatusFilter, acknowledgeFilter, deadlineFrom, deadlineTo, assignedFrom, assignedTo]);

  // Pagination logic
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
    setAcknowledgeFilter("all");
    setDeadlineFrom("");
    setDeadlineTo("");
    setAssignedFrom("");
    setAssignedTo("");
    setCurrentPage(1);
  };

  // Modal handlers
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setViewDetailsOpen(true);
  };

  const handleSubmitOutput = (task) => {
    setSelectedTask(task);
    setFile(null);
    setUploadError("");
    setUploadSuccess(false);
    setSubmitOpen(true);
  };

  const handleMarkAsRead = async (taskId) => {
    try {
      const response = await AxiosInstance.put(`/employee/tasks/?taskId=${taskId}`, {
        action: "mark_read"
      });
      
      if (response.data.success) {
        // Update local state
        await fetchTasks()
        // setTasks(tasks.map(task => 
        //   task.task_id === taskId 
        //     ? { ...task, received_employee: true } 
        //     : task
        // ));
      }
    } catch (error) {
      console.error("Error marking task as read:", error);
    }
  };

  const handleViewDetailsAndMarkRead = (task) => {
    handleViewDetails(task);
    if (!isTruthy(task.received_employee)) {
      handleMarkAsRead(task.task_id);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedTask) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", selectedTask.task_id);

      const response = await AxiosInstance.post("/employee/task_submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUploadSuccess(true);
        await fetchTasks()
        // Reset form after success
        setTimeout(() => {
          setSubmitOpen(false);
          setFile(null);
          setUploadSuccess(false);
        }, 2000);
      } else {
        setUploadError(response.data.message || "Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(error.response?.data?.message || "Failed to upload file. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div>
      {/* View Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Task Name</p>
                  <p className="text-base">{selectedTask.task_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Project</p>
                  <p className="text-base">{selectedTask.project_name || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <Badge className={
                    selectedTask.task_status === "DONE"
                      ? "bg-lime-50 text-lime-700 border-2 border-lime-200"
                      : "bg-yellow-100 text-yellow-600 border-2 border-yellow-200"
                  }>
                    {selectedTask.task_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Acknowledge Status</p>
                  <Badge className={getAcknowledgeBadgeColor(selectedTask.received_employee)}>
                    {isTruthy(selectedTask.received_employee) ? "Read" : "Not Read"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Deadline</p>
                  <p className="text-base">{formatDate(selectedTask.deadline)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Assigned On</p>
                  <p className="text-base">{formatDate(selectedTask.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Location</p>
                <p className="text-base">{selectedTask.task_loc || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Description</p>
                <p className="text-base">{selectedTask.task_description || "No description provided."}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600">Assigned By</p>
                <p className="text-base">{selectedTask.creator_name || "N/A"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Output Modal */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Task Output</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Task</p>
                <p className="text-base">{selectedTask.task_name}</p>
              </div>

              {uploadSuccess ? (
                <div className="rounded-lg bg-lime-50 p-4 text-center">
                  <p className="text-lime-700 font-semibold">✓ File uploaded successfully!</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Select File
                    </label>
                    <div className="relative">
                      <Input
                        type="file"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          setUploadError("");
                        }}
                        className="cursor-pointer rounded-md bg-mist-200 border-mist-700 border-dashed px-2"
                        disabled={uploadLoading}
                      />
                    </div>
                    {file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: <span className="font-semibold">{file.name}</span>
                      </p>
                    )}
                  </div>

                  {uploadError && (
                    <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2 text-sm text-red-700">
                      <AlertCircle className="size-4 mt-0.5 shrink-0" />
                      <p>{uploadError}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleFileUpload}
                      disabled={!file || uploadLoading}
                      className="flex-1 gap-2 bg-lime-600 hover:bg-lime-700"
                    >
                      <Upload className="size-4" />
                      {uploadLoading ? "Uploading" : "Upload"}
                    </Button>
                    <Button
                      onClick={() => setSubmitOpen(false)}
                      variant="outline"
                      disabled={uploadLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4">
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
                {getFilterLabel(taskStatusFilter, TASK_STATUSES)}
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

          {/* Acknowledge Filter */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Acknowledge Status
            </label>
            <Select
              value={acknowledgeFilter}
              onValueChange={(value) => handleFilterChange(setAcknowledgeFilter, value)}
            >
              <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                {getFilterLabel(acknowledgeFilter, ACKNOWLEDGE_STATUSES)}
              </SelectTrigger>
              <SelectContent>
                {ACKNOWLEDGE_STATUSES.map((status) => (
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Task name or project..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {
            (searchQuery || taskStatusFilter !== "all" || acknowledgeFilter !== "all" || deadlineFrom || deadlineTo || assignedFrom || assignedTo) && (

                <div className="flex justify-end">
                <Button
                    onClick={handleClearFilters}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="size-4" />
                    Clear Filters
                </Button>
                </div>
            )
        }
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedTasks.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
        {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
      </div>

      {paginatedTasks.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-lime-400/50">
              <TableRow>
                <TableHead className="text-black font-semibold">Task Name</TableHead>
                <TableHead className="text-black font-semibold text-end">Deadline</TableHead>
                <TableHead className="text-black font-semibold text-start">Status</TableHead>
                <TableHead className="text-black font-semibold text-center">Task Location</TableHead>
                <TableHead className="text-black font-semibold text-end">Project</TableHead>
                <TableHead className="text-black font-semibold text-start">Assigned By</TableHead>
                <TableHead className="text-black font-semibold text-end">Acknowledge</TableHead>
                <TableHead className="text-black font-semibold text-end">Assigned On</TableHead>
                <TableHead className="text-black font-semibold text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.map((task) => (
                <TableRow key={task.task_id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{task.task_name || "N/A"}</TableCell>
                  <TableCell className="text-end">{formatDate(task.deadline)}</TableCell>
                  <TableCell className="text-start">
                    <Badge className={
                        task.task_status === "DONE"
                        ? `rounded-lg p-1 bg-lime-50 text-lime-700 border-2 border-lime-200`
                        : `rounded-lg p-1 bg-yellow-100 text-yellow-600 border-2 border-yellow-200`
                    }>
                      {task.task_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{task.task_loc || "N/A"}</TableCell>
                  <TableCell className="text-end">{task.project_name || "N/A"}</TableCell>
                  <TableCell className="text-start">{task.creator_name || "N/A"}</TableCell>
                  <TableCell className="text-end">
                    <Badge className={getAcknowledgeBadgeColor(task.received_employee)}>
                      {isTruthy(task.received_employee) ? "Read" : "Not Read"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">{formatDate(task.created_at)}</TableCell>
                  <TableCell>
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
                            className="hover:bg-lime-300/40 justify-start rounded-t-lg tracking-normal gap-2"
                            onClick={() => handleViewDetailsAndMarkRead(task)}
                          >
                            <Eye className="size-4" />
                            View Details
                          </Button>
                          <Button
                            type="button" 
                            variant="outline"
                            disabled={task.task_status === "DONE"}
                            className="hover:bg-lime-300/40 justify-start text-blue-600 tracking-normal gap-2"
                            size="sm"
                            onClick={() => handleSubmitOutput(task)}
                          >
                            <FileInput className="size-4" />
                            Submit Output
                          </Button>
                          {!isTruthy(task.received_employee) && (
                            <Button
                              type="button" 
                              variant="outline"
                              className="hover:bg-lime-300/40 rounded-b-lg justify-start text-lime-500 tracking-normal gap-2"
                              size="sm"
                              onClick={() => handleMarkAsRead(task.task_id)}
                            >
                              <MailOpen className="size-4" />
                              Mark as Read
                            </Button>
                          )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-gray-500">No tasks found matching your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
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
      )}
    </div>
  );
}