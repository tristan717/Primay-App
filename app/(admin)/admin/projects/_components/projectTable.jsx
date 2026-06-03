import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CircleCheck, CircleCheckBig, Clock, Ellipsis, Loader } from "lucide-react";
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AxiosInstance from "@/utils/axios";

export default function ProjectTable({ dataTable, isLoading, onRefresh   }) {
    const route = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDialog, setConfirmDialog] = useState({
      isOpen: false,
      action: null,
      projectId: null,
      projectName: null,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredData = Array.isArray(dataTable) 
    ? dataTable.filter((project) =>
        project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.lead_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];


    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, endIndex);



    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleRedirect = (id) => {
        route.push(`/admin/projects/${id}`);
    }
    function prioFormat(data){
        switch(data){
            case "LOW":
                return <Badge className="p-1 w-15 rounded-lg border border-green-500 bg-green-500/30 text-green-700">Low</Badge>;
            case "MID":
                return <Badge className="p-1 w-15 rounded-lg border border-yellow-500 bg-yellow-500/30 text-yellow-700">Mid</Badge>;
            case "HIGH":
                return <Badge className="p-1 w-15 rounded-lg border border-red-500 bg-red-500/30 text-red-700">High</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    }

    function dateFormat(dateString) {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return "Invalid Date";
        }
    }
    const handleActionClick = (action, projectId, projectName) => {
      setConfirmDialog({
        isOpen: true,
        action,
        projectId,
        projectName,
      });
    };

    const handleConfirmAction = async () => {
      const { action, projectId, projectName } = confirmDialog;
      
      try {
        setIsUpdating(true);
        const response = await AxiosInstance.put("/project", {
          projectId,
          action,
          projectName
        });

        if(response){
            console.log("response: ", response)
            if(response.data){
                const res = response.data;
                if(res.code === 200 && res.success === true){
                        // Close dialog
                    setConfirmDialog({
                        isOpen: false,
                        action: null,
                        projectId: null,
                        projectName: null,
                    });

                    if (onRefresh) {
                        await onRefresh();
                    }

                    
                    // Show success message (you can add a toast here)
                    console.log(response.data.message);
                }
            }
        }
      } catch (error) {
        console.error("Error updating project:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    const getActionTitle = (action) => {
      if (action === "finish") return "Mark as Finished";
      if (action === "archive") return "Archive Project";
      return "Confirm Action";
    };

    const getActionDescription = (action, projectName) => {
      if (action === "finish") {
        return `Are you sure you want to mark "${projectName}" as finished? This project will be marked as completed.`;
      }
      if (action === "archive") {
        return `Are you sure you want to archive "${projectName}"? This project will be hidden from active projects.`;
      }
      return "Are you sure?";
    };








    return (
    <div className="relative">
            { isLoading && (
                <div className="animate-pulse absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
                    <div className="flex flex-col items-center gap-3">
                        <Loader className="animate-spin w-8 h-8 text-blue-500" />
                        <p className="text-sm font-medium text-gray-600">Please Wait</p>
                    </div>
                </div>
            )}

            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => {
              if (!open) {
                setConfirmDialog({
                  isOpen: false,
                  action: null,
                  projectId: null,
                  projectName: null,
                });
              }
            }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{getActionTitle(confirmDialog.action)}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {getActionDescription(confirmDialog.action, confirmDialog.projectName)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmAction}
                    disabled={isUpdating}
                    className={confirmDialog.action === "archive" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {isUpdating ? "Updating" : getActionTitle(confirmDialog.action)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        <div>
            <div className="mb-4 flex items-center gap-2">
                <Input
                    type="text"
                    placeholder="Search Project Title or Lead's Name"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
                    text-sm ring-offset-background placeholder:text-muted-foreground 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-200 focus-visible:ring-offset-2 
                    disabled:cursor-not-allowed disabled:opacity-50"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setCurrentPage(1);
                        }}
                        className="shrink-0"
                    >
                        Clear
                    </Button>
                )}
            </div>

            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-25 text-start">Project Title</TableHead>
                    <TableHead className="text-center">Project Lead</TableHead>
                    <TableHead className="text-center">Project Duration</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Project Status</TableHead>
                    <TableHead className="text-center">Created On</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData && paginatedData.length > 0
                        ? paginatedData.map((project) => (
                                <TableRow
                                    key={project.project_id}
                                    className="cursor-pointer hover:bg-lime-300/20">
                                    <TableCell className="font-medium text-start">{project.project_name}</TableCell>
                                    <TableCell className="font-medium text-center">{project.lead_name}</TableCell>
                                    <TableCell className="font-medium text-center">{dateFormat(project.duration_from)} - {dateFormat(project.duration_to)}</TableCell>
                                    <TableCell className="font-medium text-center">{prioFormat(project.priority)}</TableCell>
                                    <TableCell className="font-medium text-center flex justify-center">{project.status ? (<CircleCheck className="w-7 h-7 text-green-500" />) : (<Clock className="w-7 h-7 text-blue-500" />)}</TableCell>
                                    <TableCell className="font-medium text-center">{dateFormat(project.createdAt)}</TableCell>
                                    <TableCell className="font-medium text-center">
                                        <Popover>
                                            <PopoverTrigger>
                                                <Ellipsis />
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0 w-auto rounded-lg bg-white/30 backdrop-blur-3xl">
                                                <div className="flex flex-col gap-0 p-0">
                                                <Button variant="ghost" size="sm"
                                                    onClick={() => handleActionClick("finish", project.project_id, project.project_name)} 
                                                    className={
                                                        `hover:bg-lime-300/40 justify-start rounded-t-lg gap-2 text-lime-500`
                                                        + (project.status ? " hidden" : "")}>
                                                    Mark as Finished
                                                </Button>
                                                <Button variant="ghost" size="sm" 
                                                    onClick={() => handleActionClick("archive", project.project_id, project.project_name)}
                                                    className={
                                                        project.status 
                                                        ? `hover:bg-lime-300/40 justify-start text-red-600 gap-2 rounded-t-lg`
                                                        : `hover:bg-lime-300/40 justify-start text-red-600 gap-2`
                                                    }>
                                                    Archive
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleRedirect(project.project_id)} className="hover:bg-lime-300/40 justify-start gap-2 rounded-b-lg">
                                                    Workshop
                                                </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))
                        : (<TableRow><TableCell colSpan={5} className="text-center py-4">No data available</TableCell></TableRow>)
                    }
                </TableBody>
            </Table>

            {totalPages > 0 && (
                <div className="flex items-center justify-between mt-6 px-4">
                    <div className="text-sm text-gray-600">
                        {searchQuery && <span>Filtered: </span>}
                        Page {currentPage} of {totalPages} • Total: {totalItems} items
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </Button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageClick(page)}
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>

    </div>
    )
}
