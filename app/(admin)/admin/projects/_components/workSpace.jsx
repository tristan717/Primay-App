"use client";
import { useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AxiosInstance from "@/utils/axios";
import { CalendarDays, AlertCircle, X, Loader2, Ellipsis, Eye, SquarePen, Archive, ChevronLeft, ChevronRight, IdCardLanyard, ClipboardList, Clock, Waypoints, MapPin, ListCollapse, Info, TriangleAlert } from "lucide-react";

const ITEMS_PER_PAGE = 8;

export default function Workspace({ id }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [archiveModal, setArchiveModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Form states - Create
    const [taskName, setTaskName] = useState("");
    const [taskDetails, setTaskDetails] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskLoc, setTaskLoc] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [searchVal, setSearchVal] = useState("");

    // Form states - Edit
    const [editTaskName, setEditTaskName] = useState("");
    const [editTaskDetails, setEditTaskDetails] = useState("");
    const [editDeadline, setEditDeadline] = useState("");
    const [editTaskLoc, setEditTaskLoc] = useState("");
    const [editSelectedEmployee, setEditSelectedEmployee] = useState("");
    const [editSearchVal, setEditSearchVal] = useState("");
    const [statusProject, setStatusProject] = useState(false);

    // Memoize fetch functions
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/task?project_id=${id}`);
            if (response?.data?.success) {
                setTasks(response.data.tasks);
                setCurrentPage(1);
                setStatusProject(response.data.projectData.status);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);


    const fetchEmployees = useCallback(async () => {
        try {
            const response = await AxiosInstance.get('/userSelect');
            if (response?.data?.success) {
                setEmployees(response.data.userData);
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    }, []);

    useEffect(() => {
        async function populators(){
            await fetchEmployees();
            await fetchTasks();
        }
        populators();
    }, [fetchEmployees, fetchTasks]);

    // Pagination logic
    const totalItems = tasks.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    const filteredEmployees = employees.filter((emp) =>
        emp.f_name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        emp.l_name?.toLowerCase().includes(searchVal.toLowerCase())
    );

    const filteredEditEmployees = employees.filter((emp) =>
        emp.f_name?.toLowerCase().includes(editSearchVal.toLowerCase()) ||
        emp.l_name?.toLowerCase().includes(editSearchVal.toLowerCase())
    );

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return "";
        }
    };

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

    const getEmployeeName = (userId) => {
        const emp = employees.find(e => e.user_id === userId);
        return emp ? `${emp.f_name} ${emp.l_name}` : "Unknown";
    };

    const validateForm = () => {
        const newErrors = {};
        
        const valDeadline = new Date(deadline);
        const dateDeadline = valDeadline.getTime();
        const employeeExist = !employees.some(emp => emp.user_id === selectedEmployee);

        if (!taskName.trim()) newErrors.taskName = "Task name is required.";
        if (!taskDetails.trim()) newErrors.taskDetails = "Task details are required.";
        if (!selectedEmployee) newErrors.selectedEmployee = "Employee is required.";
        if (!deadline) newErrors.deadline = "Deadline is required.";
        
        if (employeeExist) {
            newErrors.selectedEmployee = "Selected employee does not exist.";
        }
        
        if (typeof taskName !== 'string') newErrors.taskName = "Invalid input.";
        if (typeof taskDetails !== 'string') newErrors.taskDetails = "Invalid input.";
        if (typeof dateDeadline !== 'number') {
            newErrors.deadline = "Invalid Date.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const validateEditForm = () => {
        const newErrors = {};
        
        const valDeadline = new Date(editDeadline);
        const dateDeadline = valDeadline.getTime();
        const employeeExist = !employees.some(emp => emp.user_id === editSelectedEmployee);

        if (!editTaskName.trim()) newErrors.editTaskName = "Task name is required.";
        if (!editTaskDetails.trim()) newErrors.editTaskDetails = "Task details are required.";
        if (!editSelectedEmployee) newErrors.editSelectedEmployee = "Employee is required.";
        if (!editDeadline) newErrors.editDeadline = "Deadline is required.";
        
        if (employeeExist) {
            newErrors.editSelectedEmployee = "Selected employee does not exist.";
        }
        if (typeof editTaskName !== 'string') newErrors.editTaskName = "Invalid input.";
        if (typeof editTaskDetails !== 'string') newErrors.editTaskDetails = "Invalid input.";
        if (typeof dateDeadline !== 'number') {
            newErrors.editDeadline = "Invalid Date.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                task_name: taskName,
                task_details: taskDetails,
                deadline: deadline,
                task_loc: taskLoc,
                user_id_employee: selectedEmployee,
                project_id: id,
            };

            const response = await AxiosInstance.post("/task", { payload });

            if (response?.data?.success) {
                handleReset();
                fetchTasks();
            }
        } catch (error) {
            console.error("Failed to create task:", error);
            setErrors({ submit: "Failed to create task" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setTaskName("");
        setTaskDetails("");
        setDeadline("");
        setTaskLoc("");
        setSelectedEmployee("");
        setSearchVal("");
        setErrors({});
    };

    // Modal handlers
    const openViewModal = (task) => {
        setSelectedTask(task);
        setViewModal(true);
    };

    const openEditModal = (task) => {
        setSelectedTask(task);
        setEditTaskName(task.task_name);
        setEditTaskDetails(task.task_details);
        setEditDeadline(formatDateForInput(task.deadline));
        setEditTaskLoc(task.task_loc);
        setEditSelectedEmployee(task.user_id_employee);
        setEditModal(true);
    };

    const openArchiveModal = (task) => {
        setSelectedTask(task);
        setArchiveModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) return;

        setSubmitting(true);

        try {
            const payload = {
                task_name: editTaskName,
                task_details: editTaskDetails,
                deadline: editDeadline,
                task_loc: editTaskLoc,
                user_id_employee: editSelectedEmployee,
            };

            const response = await AxiosInstance.put(`/task/${selectedTask.task_id}`, { payload });

            if (response?.data?.success) {
                fetchTasks();
                setEditModal(false);
            }
        } catch (error) {
            console.error("Failed to update task:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchive = async () => {
        setSubmitting(true);

        try {
            const response = await AxiosInstance.put(`/task/archive`, { id: selectedTask.task_id});

            if (response?.data?.success) {
                fetchTasks();
                setArchiveModal(false);
            }
        } catch (error) {
            console.error("Failed to archive task:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getTomorrowDateString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


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
    return (
        <div className="mt-5 w-full">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-1 border-0 shadow-lg py-3 gap-1">
                    <CardHeader className="px-3">
                        <CardTitle className="text-center text-sm md:text-lg font-extrabold">Create Task</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field className="gap-1">
                                <Label className="text-sm">Task Name <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Task name"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    className="bg-gray-100/50"
                                />
                                {errors.taskName && <p className="text-red-500 text-xs mt-1">{errors.taskName}</p>}
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Assign Employee <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <Combobox value={selectedEmployee} name="employee" onValueChange={setSelectedEmployee}>
                                            <ComboboxInput 
                                                placeholder="Search and select employee." 
                                                value={
                                                    selectedEmployee 
                                                        ? getEmployeeName(selectedEmployee)
                                                        : searchVal
                                                }
                                                onValueChange={setSearchVal}
                                                className="bg-gray-100/50"
                                            />
                                            <ComboboxContent>
                                                <ComboboxList>
                                                    {filteredEmployees.length > 0
                                                        ? filteredEmployees.map((emp) => (
                                                            <ComboboxItem key={emp.user_id} value={emp.user_id}>
                                                                {emp.f_name} {emp.l_name}
                                                            </ComboboxItem>
                                                        ))
                                                        :(<ComboboxEmpty>No employees found</ComboboxEmpty>)
                                                    }
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    </div>
                                    {selectedEmployee && (
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedEmployee("")}
                                            className="border border-red-500 text-red-700 px-3 h-10 shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                {errors.selectedEmployee && <p className="text-red-500 text-xs mt-1">{errors.selectedEmployee}</p>}
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Deadline <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={deadline}
                                    min={getTomorrowDateString()}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="bg-gray-100/50"
                                />
                                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Location (Optional)</Label>
                                <Input
                                    placeholder="Task location"
                                    value={taskLoc}
                                    onChange={(e) => setTaskLoc(e.target.value)}
                                    className="bg-gray-100/50"
                                />
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Task Details <span className="text-red-500">*</span></Label>
                                <Textarea
                                    placeholder="Project details"
                                    value={taskDetails}
                                    onChange={(e) => setTaskDetails(e.target.value)}
                                    rows={3}
                                    className="bg-gray-100/50"
                                />
                                {errors.taskDetails && <p className="text-red-500 text-xs mt-1">{errors.taskDetails}</p>}
                            </Field>

                            {errors.submit && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.submit}
                                </div>
                            )}

                            <div className="flex flex-col xl:flex-row gap-2 justify-end">
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    variant="outline"
                                    disabled={submitting || statusProject}
                                    className="border-yellow-300 text-yellow-300"
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting || statusProject}
                                    className="bg-lime-400 text-white hover:bg-lime-300 hover:text-black"
                                >
                                    {submitting 
                                        ? (<span className="flex flex-row items-center gap-1"><Loader2 className="size-4 animate-spin"></Loader2> Loading</span>) 
                                        : (statusProject
                                            ? <span className="flex flex-row items-center gap-1">Project Finished</span>
                                            : <span className="flex flex-row items-center gap-1"><CalendarDays className="size-4" /> Create Task</span>
                                        )
                                    }
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tasks Table Section */}
                <div className="lg:col-span-2">
                    <Card className="border-0 md:h-full shadow-lg pt-3 gap-1">
                        <CardHeader className="px-2">
                            <CardTitle>Tasks for this project</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            {loading ? (
                                <div className="flex flex-row gap-1 items-center justify-center py-8 text-gray-500">
                                    <Loader2 className="animate-spin" ></Loader2>Loading tasks
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    No tasks yet. Create one to get started!
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="h-6 text-xs sm:text-sm">Task</TableHead>
                                                    <TableHead className="h-6 text-xs sm:text-sm text-end">Assigned To</TableHead>
                                                    <TableHead className="h-6 text-xs sm:text-sm text-start">Acknowledged</TableHead>
                                                    <TableHead className="h-6 text-xs sm:text-sm">Deadline</TableHead>
                                                    <TableHead className="h-6 text-xs sm:text-sm text-center">Status</TableHead>
                                                    <TableHead className="h-6 text-xs sm:text-sm text-center">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedTasks.map((task) => (
                                                    <TableRow key={task.task_id} className="hover:bg-gray-50 bg-mist-100/80">
                                                        <TableCell className="text-xs sm:text-sm font-medium">{task.task_name}</TableCell>
                                                        <TableCell className="text-xs sm:text-sm text-end">{task.employee_name}</TableCell>
                                                        <TableCell className="text-xs sm:text-sm text-start">
                                                            <Badge className={getAcknowledgeBadgeColor(task.received_employee)}>
                                                                {isTruthy(task.received_employee) ? "Read" : "Not Read"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs sm:text-sm">{formatDate(task.deadline)}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className={
                                                                `${task.task_status}` === "DONE"
                                                                ? `rounded-lg p-1 bg-lime-50 text-lime-700 border-2 border-lime-200`
                                                                : `rounded-lg p-1 bg-yellow-100 text-yellow-600 border-2 border-yellow-200`
                                                            }>
                                                                {task.task_status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Popover>
                                                                <PopoverTrigger>
                                                                    <Ellipsis className="w-5 h-5 cursor-pointer mx-auto" />
                                                                </PopoverTrigger>
                                                                <PopoverContent className="p-0 w-auto rounded-lg bg-white/30 backdrop-blur-3xl">
                                                                    <div className="flex flex-col gap-0 p-0">
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            onClick={() => openViewModal(task)}
                                                                            className="hover:bg-lime-300/40 justify-start rounded-t-lg gap-2"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                            View Details
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            disabled={task.received_employee === true || task.task_status === "DONE"} 
                                                                            onClick={() => openEditModal(task)}
                                                                            className="hover:bg-lime-300/40 justify-start text-yellow-600 gap-2"
                                                                        >
                                                                            <SquarePen className="w-4 h-4" />
                                                                            Update Task
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            onClick={() => openArchiveModal(task)}
                                                                            className="hover:bg-lime-300/40 rounded-b-lg justify-start text-red-600 gap-2"
                                                                        >
                                                                            <Archive className="w-4 h-4" />
                                                                            Archive Task
                                                                        </Button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                            <div className="text-sm text-gray-600">
                                                Page {currentPage} of {totalPages} • Total: {totalItems} items
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                                                            onClick={() => setCurrentPage(page)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="gap-1"
                                                >
                                                    Next <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* View Details Modal */}
            <Dialog open={viewModal} onOpenChange={setViewModal}>
                <DialogContent className="rounded-md m-2 md:m-0 [&>button:last-child]:hidden">
                    <DialogHeader>
                        <DialogTitle>Task Details</DialogTitle>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2">
                                
                                <div className="flex flex-row items-center gap-1">
                                    <div>
                                        <ClipboardList className="h-8 w-8" />
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-xs capitalize font-semibold text-lime-600">Task Name</Label>
                                        <p className="text-base font-bold text-black">{selectedTask.task_name}</p>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-1">
                                    <div>
                                        <IdCardLanyard className="h-8 w-8"/> 
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-xs capitalize font-semibold text-lime-600">Assigned To</Label>
                                        <p className="text-base font-bold text-black">{selectedTask.employee_name}</p>
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-2 pt-3 mb-3">
                                <div className="flex flex-row items-center gap-1">
                                    <div>
                                        <Clock className="h-8 w-8"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-xs capitalize font-semibold text-lime-600">Deadline</Label>
                                        <p className="text-base font-bold text-black">{formatDate(selectedTask.deadline)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-1">
                                    <div>
                                        <Waypoints className="h-8 w-8" />
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-xs capitalize font-semibold text-lime-600">Status</Label>
                                        <Badge className={
                                            `${selectedTask.task_status}` === "DONE"
                                            ? `p-1 mt-1 inline-block px-2 py-1 font-bold rounded-md bg-lime-50 text-lime-700 border-2 border-lime-200`
                                            : `p-1  mt-1 inline-block px-2 py-1 font-bold rounded-md bg-yellow-100 text-yellow-600 border-2 border-yellow-200`
                                        }>
                                            {selectedTask.task_status}
                                        </Badge>
                                    </div>
                                </div>

                            </div>

                            <div  className="mt-4">
                                <div className="flex flex-row items-center gap-1">
                                    <Label className="text-xs capitalize font-semibold text-lime-600">Location</Label>
                                    <MapPin className="h-4 w-4"  />
                                </div>
                                <p className="text-base font-bold text-black">{selectedTask.task_loc || "N/A"}</p>
                            </div>

                            <div>
                                <div className="flex flex-row items-center gap-1">
                                    <Label className="text-xs capitalize font-semibold text-lime-600">Details</Label>
                                    <Info  className="h-4 w-4" />
                                </div>
                                <p className="text-base font-bold text-black">{selectedTask.task_details}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose className="border border-red-500 bg-mist-100 hover:bg-red-500 hover:text-white text-red-500 p-2 rounded-md">
                            <span>Close</span>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-md [&>button:last-child]:hidden">
                    <DialogHeader>
                        <DialogTitle className="text-center">Update Task</DialogTitle>
                    </DialogHeader>
                    {selectedTask && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <Field className="gap-1">
                                <Label className="text-sm">Task Name</Label>
                                <Input
                                    value={editTaskName}
                                    onChange={(e) => setEditTaskName(e.target.value)}
                                    className="bg-gray-100/50"
                                />
                                {errors.editTaskName && <p className="text-red-500 text-xs mt-1">{errors.editTaskName}</p>}
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Assign Employee</Label>
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <Combobox value={editSelectedEmployee} name="employee" onValueChange={setEditSelectedEmployee}>
                                            <ComboboxInput 
                                                placeholder="Search employee" 
                                                value={
                                                    editSelectedEmployee 
                                                        ? getEmployeeName(editSelectedEmployee)
                                                        : editSearchVal
                                                }
                                                onValueChange={setEditSearchVal}
                                                className="bg-gray-100/50"
                                            />
                                            <ComboboxContent>
                                                <ComboboxList>
                                                    {filteredEditEmployees.length > 0
                                                        ? filteredEditEmployees.map((emp) => (
                                                            <ComboboxItem key={emp.user_id} value={emp.user_id}>
                                                                {emp.f_name} {emp.l_name}
                                                            </ComboboxItem>
                                                        ))
                                                        :(<ComboboxEmpty>No employees found.</ComboboxEmpty>)
                                                    }
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    </div>
                                    {editSelectedEmployee && (
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditSelectedEmployee("")}
                                            className="border border-red-500 text-red-700 px-3 h-10 shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                {errors.editSelectedEmployee && <p className="text-red-500 text-xs mt-1">{errors.editSelectedEmployee}</p>}
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Deadline</Label>
                                <Input
                                    type="date"
                                    min={getTomorrowDateString()}
                                    value={editDeadline}
                                    onChange={(e) => setEditDeadline(e.target.value)}
                                    className="bg-gray-100/50"
                                />
                                {errors.editDeadline && <p className="text-red-500 text-xs mt-1">{errors.editDeadline}</p>}
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Location</Label>
                                <Input
                                    value={editTaskLoc}
                                    onChange={(e) => setEditTaskLoc(e.target.value)}
                                    className="bg-gray-100/50"
                                />
                            </Field>

                            <Field className="gap-1">
                                <Label className="text-sm">Task Details</Label>
                                <Textarea
                                    value={editTaskDetails}
                                    onChange={(e) => setEditTaskDetails(e.target.value)}
                                    rows={3}
                                    className="bg-gray-100/50"
                                />
                                {errors.editTaskDetails && <p className="text-red-500 text-xs mt-1">{errors.editTaskDetails}</p>}
                            </Field>

                            {errors.submit && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.submit}
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-red-600 text-red-600"
                                    onClick={() => setEditModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-lime-400 text-white hover:bg-lime-300 hover:text-black"
                                >
                                    {submitting ? (<label className="flex flex-row gap-1 text-black"><Loader2 className="animate-spin"/> Loading</label>) : "Update Task"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation Modal */}
            <Dialog open={archiveModal} onOpenChange={setArchiveModal}>
                <DialogContent className="max-w-md mx-5 rounded-md [&>button:last-child]:hidden">
                    <DialogHeader>
                        <DialogTitle>Archive Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive this task?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                                <label className="flex flex-row items-center gap-1 capitalized text-base md:text-lg text-red-600"><TriangleAlert /> Warning!</label>
                                <p className="text-sm text-red-800">
                                    You are about to archive <strong>&quot;{selectedTask.task_name}&quot;</strong>. This action cannot be undone.
                                    After archiving, you will not see this task again.
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setArchiveModal(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleArchive}
                            disabled={submitting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {submitting ? "Archiving..." : "Archive Task"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}