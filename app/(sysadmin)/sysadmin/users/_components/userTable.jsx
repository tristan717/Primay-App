"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AxiosInstance from "@/utils/axios";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, X, Eye, Ellipsis, Loader2, UserRoundPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, Pencil } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "SYSADMIN", label: "Sysadmin" },
];

export default function UserTable() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [banConfirmOpen, setBanConfirmOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [userToBan, setUserToBan] = useState(null);
    const [userToUpdate, setUserToUpdate] = useState(null);
    const [updateFormData, setUpdateFormData] = useState({
        f_name: "",
        l_name: "",
        email: "",
        position: "",
        role: "EMPLOYEE",
    });
    const [isBanning, setIsBanning] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        f_name: "",
        l_name: "",
        email: "",
        position: "",
        role: "EMPLOYEE",
        username: "",
        department: "",
    });


    const handleCreateUser = async () => {
        // Validate form
        if (!createFormData.f_name || !createFormData.l_name || !createFormData.email) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(createFormData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        setIsCreating(true);
        try {
            const response = await AxiosInstance.post("/users/create", createFormData);

            if (response?.data?.success) {
                // Success - reset form and close modal
                setCreateFormData({
                    f_name: "",
                    l_name: "",
                    email: "",
                    position: "",
                    role: "EMPLOYEE",
                    department: "",
                });
                setCreateModalOpen(false);
                
                // Refresh users list
                await fetchUsers();
                alert("User created successfully!");
            } else {
                alert(response?.data?.message || "Failed to create user.");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert(error.response?.data?.message || "Error creating user. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    async function fetchUsers(){
        try {
            const response = await AxiosInstance.get("/users/getUsers");
            if(response){
                if(response.data){
                    const res = response.data;
                    if(res.code === 200 && res.success === true){
                        setUsers(res.users)
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    useEffect(() => {
        async function loadUsers(){
            await fetchUsers();
        }
        loadUsers();
    },[])

    console.log(users)

    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];

        return users.filter((user) => {
        // Search filter
        const searchLower = (searchQuery || "").toLowerCase();
        const matchesSearch =
            (user.f_name || "").toLowerCase().includes(searchLower) ||
            (user.l_name || "").toLowerCase().includes(searchLower) ||
            (`${user.f_name} ${user.l_name}`.toLowerCase()).includes(searchLower) ||
            (user.email || "").toLowerCase().includes(searchLower);

        if (searchQuery && !matchesSearch) return false;

        // Role filter
        if (roleFilter !== "all") {
            if (user.role !== roleFilter) return false;
        }

        return true;
        });
    }, [users, searchQuery, roleFilter]);

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, pageSize]);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setRoleFilter("all");
        setCurrentPage(1);
    };

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

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    const handleBanClick = (user) => {
        setUserToBan(user);
        setBanConfirmOpen(true);
    };

    const handleBanConfirm = async () => {
        if (!userToBan) return;
        
        setIsBanning(true);
        try {
            const response = await AxiosInstance.put("/users/getUsers", {
                action: "ban_user",
                userId: userToBan.user_id,
            });

            if (response?.data?.success) {
            // Update local state
            fetchUsers()
            setBanConfirmOpen(false);
            setUserToBan(null);
            } else {
            alert(response?.data?.message || "Failed to ban user.");
            }
        } catch (error) {
            console.error("Error banning user:", error);
            alert("Error banning user. Please try again.");
        } finally {
            setIsBanning(false);
        }
    };

    const handleUpdateClick = (user) => {
        setUserToUpdate(user);
        setUpdateFormData({
            f_name: user.f_name,
            l_name: user.l_name,
            email: user.email,
            position: user.position || "",
            role: user.role,
        });
        setUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async () => {
        if (!userToUpdate) return;

        // Validate form
        if (!updateFormData.f_name || !updateFormData.l_name || !updateFormData.email) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsUpdating(true);
        try {
            const response = await AxiosInstance.put("/users/getUsers", {
                action: "update_user",
                userId: userToUpdate.user_id,
                data: updateFormData,
            });

            if (response?.data?.success) {
            // Update local state
            fetchUsers()
            setUpdateModalOpen(false);
            setUserToUpdate(null);
            } else {
            alert(response?.data?.message || "Failed to update user.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Error updating user. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBan = (userId) => {
        const user = users.find(u => u.user_id === userId);
        if (user) {
            handleBanClick(user);
        }
    };

    const handleUpdate = (userId) => {
        const user = users.find(u => u.user_id === userId);
        if (user) {
            handleUpdateClick(user);
        }
    };


    const colorMethod = (method) => {
        switch(method){
            case false:
                return "p-1 rounded-lg bg-lime-200 text-lime-600 border-2 border-lime-600";
            case true:
                return "p-1 rounded-lg bg-red-200 text-red-600 border-2 border-red-600";
            default:
                return "text-gray-600 border-gray-600";
        }
    }
    return (
        <div>
            <div className="mb-2 flex items-center justify-end gap-4">
                <Button variant="outline" className="gap-2 rounded-lg border-lime-500 text-lime-500" onClick={() => setCreateModalOpen(true)}> <UserRoundPlus /> Create User</Button>
            </div>

            <div className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                {/* Search */}
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Search User
                    </label>
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                        }}
                        className="pl-9"
                    />
                    </div>
                </div>

                {/* Role Filter */}
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Filter by Role
                    </label>
                    <Select
                    value={roleFilter}
                    onValueChange={(value) => {
                        setRoleFilter(value);
                        setCurrentPage(1);
                    }}
                    >
                    <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                            {role.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || roleFilter !== "all") && (
                <div className="flex justify-end">
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                    <X className="size-4" />
                    Clear Filters
                    </Button>
                </div>
                )}
            </div>

            <div className="mb-4 text-sm text-gray-600">
                Showing {paginatedUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
            </div>

            {paginatedUsers.length > 0 ? (
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-lime-400/50">
                    <TableRow>
                        <TableHead className="text-black font-semibold">User</TableHead>
                        <TableHead className="text-black font-semibold text-center">Email</TableHead>
                        <TableHead className="text-black font-semibold text-center">Role</TableHead>
                        <TableHead className="text-black font-semibold text-start">Position</TableHead>
                        <TableHead className="text-black font-semibold text-start">Department</TableHead>
                        <TableHead className="text-black font-semibold text-start">Account Status</TableHead>
                        <TableHead className="text-black font-semibold text-start">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user.user_id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                            {user.f_name} {user.l_name}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                            {user.email}
                        </TableCell>
                        <TableCell className="text-center">{user.role}</TableCell>
                        <TableCell className="text-start">{user.position}</TableCell>
                        <TableCell className="text-start">{user.department}</TableCell>
                        <TableCell className="text-center text-base!">
                            <Badge className={colorMethod(user.user_status)}>
                                {user.user_status ? "Banned" : "Live" }
                            </Badge>
                        </TableCell>
                        <TableCell className="text-start">
                            <Popover>
                                <PopoverTrigger>
                                    <Ellipsis />
                                </PopoverTrigger>
                                <PopoverContent className="p-0 max-w-sm rounded-lg bg-white/30 backdrop-blur-3xl">
                                    <div className="flex flex-col  gap-0 p-0">
                                        <Button variant="outline" size="sm" 
                                            className="hover:bg-lime-300/40 justify-start rounded-t-lg gap-2"
                                            onClick={() => handleViewDetails(user)}
                                        >
                                            <Eye className="size-4" />
                                            View Details
                                        </Button>
                                        <Button variant="outline" size="sm" 
                                            className="hover:bg-lime-300/40 justify-start text-red-600 gap-2"
                                            onClick={() => handleBanClick(user)}>
                                            <Lock className="size-4" />
                                            {user.user_status ? "Unban User" : "Ban User"}
                                        </Button>
                                        <Button variant="outline" size="sm" 
                                            disabled={user.user_status}
                                            className="hover:bg-lime-300/40 rounded-b-lg justify-start text-yellow-600 gap-2"
                                            onClick={() => handleUpdateClick(user)}>
                                            <Pencil className="size-4" />
                                            Update User
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
            ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-gray-500">No users found matching your filters.</p>
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

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="min-w-5xl min-h-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Complete information about the user.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                First Name
                            </label>
                            <p className="capitalize text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedUser.f_name}
                            </p>
                            </div>
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Last Name
                            </label>
                            <p className="capitalize text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedUser.l_name}
                            </p>
                            </div>
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Email
                            </label>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedUser.email}
                            </p>
                            </div>
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Role
                            </label>
                            {selectedUser.role}
                            </div>
                        </div>
                        </div>

                        {/* Work Information */}
                        <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                            Work Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Position
                            </label>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedUser.position || "N/A"}
                            </p>
                            </div>
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Department
                            </label>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedUser.department || "N/A"}
                            </p>
                            </div>
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Organization
                            </label>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedUser.org_name || "N/A"}
                            </p>
                            </div>
                        </div>
                        </div>


                        {/* Timestamps */}
                        <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                            Timestamps
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Created At
                            </label>
                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {formatDate(selectedUser.created_at)}
                            </p>
                            </div>
                            <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Updated At
                            </label>
                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {formatDate(selectedUser.updatedAt)}
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                </DialogContent>
            </Dialog>


            {/* Ban Confirmation Modal */}
            <AlertDialog open={banConfirmOpen} onOpenChange={setBanConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                        {userToBan?.user_status ? "Unban User?" : "Ban User?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {userToBan?.user_status
                        ? `Are you sure you want to unban ${userToBan?.f_name} ${userToBan?.l_name}? They will regain access to the system.`
                        : `Are you sure you want to ban ${userToBan?.f_name} ${userToBan?.l_name}? They will not be able to access the system.`}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleBanConfirm}
                        disabled={isBanning}
                        className={userToBan?.user_status ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    >
                        {isBanning ? (<span className="flex flex-row gap-1"><Loader2 className="animate-spin"/> Banning</span>) : userToBan?.user_status ? "Unban" : "Ban"}
                    </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Update User Modal */}
            <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                    <DialogDescription>
                        Update {userToUpdate?.f_name} {userToUpdate?.l_name}&rsquo;s information.
                    </DialogDescription>
                    </DialogHeader>

                    {userToUpdate && (
                    <div className="space-y-4">
                        {/* First Name */}
                        <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                            First Name
                        </label>
                        <Input
                            value={updateFormData.f_name}
                            onChange={(e) =>
                            setUpdateFormData({ ...updateFormData, f_name: e.target.value })
                            }
                            placeholder="First name"
                        />
                        </div>

                        {/* Last Name */}
                        <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Last Name
                        </label>
                        <Input
                            value={updateFormData.l_name}
                            onChange={(e) =>
                            setUpdateFormData({ ...updateFormData, l_name: e.target.value })
                            }
                            placeholder="Last name"
                        />
                        </div>

                        {/* Email */}
                        <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={updateFormData.email}
                            onChange={(e) =>
                            setUpdateFormData({ ...updateFormData, email: e.target.value })
                            }
                            placeholder="Email"
                        />
                        </div>

                        {/* Position */}
                        <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Position
                        </label>
                        <Input
                            value={updateFormData.position}
                            onChange={(e) =>
                            setUpdateFormData({ ...updateFormData, position: e.target.value })
                            }
                            placeholder="Position"
                        />
                        </div>

                        {/* Role */}
                        <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Role
                        </label>
                        <Select
                            value={updateFormData.role}
                            onValueChange={(value) =>
                            setUpdateFormData({ ...updateFormData, role: value })
                            }
                        >
                            <SelectTrigger>
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SYSADMIN">Sysadmin</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setUpdateModalOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateSubmit}
                            disabled={isUpdating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isUpdating ? "Updating..." : "Update User"}
                        </Button>
                        </div>
                    </div>
                    )}
                </DialogContent>
            </Dialog>


            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Add a new employee to your organization.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* First Name */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                First Name *
                            </label>
                            <Input
                                value={createFormData.f_name}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, f_name: e.target.value })
                                }
                                placeholder="First name"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Last Name *
                            </label>
                            <Input
                                value={createFormData.l_name}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, l_name: e.target.value })
                                }
                                placeholder="Last name"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                username *
                            </label>
                            <Input
                                value={createFormData.username}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, username: e.target.value })
                                }
                                placeholder="username"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Email *
                            </label>
                            <Input
                                type="email"
                                value={createFormData.email}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, email: e.target.value })
                                }
                                placeholder="user@example.com"
                            />
                        </div>

                        {/* Position */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Position
                            </label>
                            <Input
                                value={createFormData.position}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, position: e.target.value })
                                }
                                placeholder="e.g. Software Engineer"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Department
                            </label>
                            <Input
                                value={createFormData.department}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, department: e.target.value })
                                }
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Role *
                            </label>
                            <Select
                                value={createFormData.role}
                                onValueChange={(value) =>
                                    setCreateFormData({ ...createFormData, role: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="SYSADMIN">Sysadmin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateUser}
                                disabled={isCreating}
                                className="bg-lime-600 hover:bg-lime-700"
                            >
                                {isCreating ? (
                                    <span className="flex flex-row gap-1">
                                        <Loader2 className="animate-spin size-4" />
                                        Creating...
                                    </span>
                                ) : (
                                    "Create User"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
