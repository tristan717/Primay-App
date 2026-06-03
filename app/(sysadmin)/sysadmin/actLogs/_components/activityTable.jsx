"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AxiosInstance from "@/utils/axios";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ActivityTable() {
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [details, setDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");

  const fetchActivities = async () => {
    try {
      const response = await AxiosInstance.get("/activity_logs");
      if (response?.data?.success && response.data.code === 200) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  console.log("Fetched activities:", activities);

  useEffect(() => {
    async function loadData() {
      await fetchActivities();
    }
    loadData();
  }, []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activities)) return [];

    return activities.filter((activity) => {
      // Search filter
      const searchLower = (searchQuery || "").toLowerCase();
      const matchesSearch =
        (activity.activity_name || "").toLowerCase().includes(searchLower) ||
        (activity.user_name || "").toLowerCase().includes(searchLower) ||
        (activity.method || "").toLowerCase().includes(searchLower);

      if (searchQuery && !matchesSearch) return false;

      // Date range filter
      if (dateFrom || dateTo) {
        const activityDate = activity.created_at ? new Date(activity.created_at) : null;
        if (activityDate) {
          if (dateFrom) {
            const fromDate = new Date(`${dateFrom}T00:00:00`);
            if (activityDate < fromDate) return false;
          }
          if (dateTo) {
            const toDate = new Date(`${dateTo}T23:59:59`);
            if (activityDate > toDate) return false;
          }
        }
      }

      return true;
    });
  }, [activities, searchQuery, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredActivities.slice(startIndex, endIndex);
  }, [filteredActivities, currentPage, pageSize]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getActivityBadgeColor = (activityName) => {
    switch (activityName?.toLowerCase()) {
      case "file upload":
        return "bg-blue-50 text-blue-700 border-2 border-blue-200";
      case "login":
        return "bg-green-50 text-green-700 border-2 border-green-200";
      case "logout":
        return "bg-red-50 text-red-700 border-2 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-2 border-gray-200";
    }
  };

  const colorMethod = (method) => {
    switch(method){
      case "POST":
        return "p-1 rounded-lg bg-lime-200 text-lime-600 border-2 border-lime-600";
      case "PUT":
        return "p-1 rounded-lg bg-yellow-200 text-yellow-600 border-2 border-yellow-600";
      default:
        return "text-gray-600 border-gray-600";
    }
  }

  const handleViewDetails = (activity) => {
    setDetails(activity);
    setFileName(activity.file_name);
    setFileUrl(activity.file_url);
    setFileType(activity.file_type);
    setIsDetailsOpen(true);
  };



  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4">
        {/* Search */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search Activity, Employee, or Method"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Date From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Date To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {(dateTo || dateFrom || searchQuery )&& (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setDateFrom("");
              setDateTo("");
              setCurrentPage(1);
            }}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedActivities.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
        {Math.min(currentPage * pageSize, filteredActivities.length)} of {filteredActivities.length} activities
      </div>

      {/* Table */}
      {paginatedActivities.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-lime-400/50">
              <TableRow>
                <TableHead className="text-black font-semibold">Activity</TableHead>
                <TableHead className="text-black font-semibold text-center">Employee</TableHead>
                <TableHead className="text-black font-semibold text-end">Role</TableHead>
                <TableHead className="text-black font-semibold text-start">Position</TableHead>
                <TableHead className="text-black font-semibold text-center">Department</TableHead>
                <TableHead className="text-black font-semibold text-end">Method</TableHead>
                <TableHead className="text-black font-semibold text-start">IP Address</TableHead>
                <TableHead className="text-black font-semibold text-end">Timestamp</TableHead>
                <TableHead className="text-black font-semibold text-end">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActivities.map((activity) => (
                <TableRow key={activity.activity_id} className="hover:bg-gray-50">
                  <TableCell className="font-bold">{activity.activity_name}</TableCell>
                  <TableCell className="font-medium text-center">{activity.user_name}</TableCell>
                  <TableCell className="text-end">{activity.role}</TableCell>
                  <TableCell className="text-start">{activity.position}</TableCell>
                  <TableCell className="text-center">{activity.department}</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline" className={colorMethod(activity.method)}>{activity.method}</Badge>
                  </TableCell>
                  <TableCell className="text-start">{activity.ip_add}</TableCell>
                  <TableCell className="text-sm text-gray-600 text-end">
                    {formatDate(activity.created_at)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(activity)}
                    >
                      <Eye className="size-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-gray-500">No activities found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="rounded-lg min-w-5xl min-h-5xl overflow-y-auto bg-mist-200">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              Contents of the logged activity.
            </DialogDescription>
          </DialogHeader>
          
          {details && (
            <div className="space-y-4">
              {/* Activity JSON */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">
                  Activity Details
                </label>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap wrap-break-word leading-relaxed">
                    {JSON.stringify(details.activity_json, null, 2)}
                  </pre>
                </div>
              </div>

              {/* File Information Grid */}
              {fileName && fileType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                    File Name
                  </label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                    {fileName}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                    File Type
                  </label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                    {fileType}
                  </div>
                </div>
              </div>
              )}

              {/* File URL */}
              {fileUrl && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                    File URL
                  </label>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                    <a 
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {fileUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}