"use client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/DashboardShell";
import { useEffect, useState } from "react";
import AxiosInstance from "@/utils/axios";
import ProjectTable from "./_components/projectTable";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "@/components/ui/field";
import { Plus, X } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminProjectsPage() {
    const [projectData, setProjectData] = useState([])
    const [projForm, setProjForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [userSelect, setUserSelect] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [searchVal, setSearchVal] = useState("");
    const [projName, setProjName] = useState("");
    const [projLoc, setProjLoc] = useState("");
    const [details, setDetails] = useState("");
    const [priorityLevel, setPriorityLevel] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);



    async function fetchProjects(){
        const response = await AxiosInstance.get('/project');
        if(response){
            const result = response.data;
            if(result.code === 200 && result.success === true){
                setProjectData(result.dataProject)
            }
        }
    }
    useEffect(() => {
        async function fetchData(){
            setIsLoading(true);
            const refetch = await fetchProjects();
            if(refetch){
                setIsLoading(false);
            }
        }
        fetchData();
    },[setProjectData])

    useEffect(() => {
        async function fetchUsers(){
             setIsLoading(true);
            const response = await AxiosInstance.get('/userSelect');
            if(response){
                const result = response.data;
                if(result.code === 200 && result.success === true){
                    setIsLoading(false);
                    setUserSelect(result.userData)
                }
            }
        }
        fetchUsers();
    },[setUserSelect, setIsLoading])

    const userDropdownData = userSelect.filter((user) =>
        user.f_name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        user.l_name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchVal.toLowerCase())
    );
    

    const handleDialog = () => {
        setProjForm(true)
    }

    const validateForm = () => {
        const newErrors = {};
                
        const valFrom = new Date(fromDate);
        const dateFr = valFrom.getTime()
        const valTo = new Date(toDate);
        const dateTo = valTo.getTime()
        const userExist = !userSelect.some(user => user.user_id === selectedUser)

        if (!projName.trim()) newErrors.projName = "Project name is required";
        if (!details.trim()) newErrors.details = "Project details are required";
        if (!selectedUser) newErrors.selectedUser = "Project lead is required";
        if (!priorityLevel) newErrors.priorityLevel = "Priority level is required";
        if (!fromDate) newErrors.fromDate = "Start date is required";
        if (!toDate) newErrors.toDate = "End date is required";
        if (userExist) {
            newErrors.selectedUser = "Selected user does not exist";
        }
        if (typeof projName !== 'string') newErrors.projName = "Invalid input";
        if (typeof details !== 'string') newErrors.details = "Invalid input";
        if(typeof dateFr !== 'number'){
            newErrors.fromDate = "Invalid Date";
        }
        if(typeof dateTo !== 'number'){
            newErrors.toDate = "Invalid Date";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            setProjForm(true);
            return;
        }

        setProjForm(false);
        setIsLoading(true);
        const payload = {
            proj_name: projName,
            proj_loc: projLoc,
            details: details,
            proj_lead: selectedUser,
            priority_level: priorityLevel,
            fromDate: fromDate,
            toDate: toDate
        };
        const response = await AxiosInstance.post("/project", {payload})
        if (response){
            if(response?.data){
                const res = response.data;
                if(res.code === 200 && res.success === true){
                    const updatedProjects = await AxiosInstance.get('/project');
                    if (updatedProjects?.data?.success) {
                        setProjectData(updatedProjects.data.dataProject);
                    }
                }
            }
        }
        setIsLoading(false);
        console.log('response: ', response)
        console.log('payload: ', payload)

        return; 
    }

    function handleReset(){
        setProjName("");
        setProjLoc("");
        setDetails("");
        setSelectedUser("");
        setPriorityLevel("");
        setFromDate("");
        setToDate("");
        setErrors({});
        return;
    }
  return (
    <div>
        <PageHeader
            eyebrow="Project management"
            title="Projects Table"
            description="Use this page to define project scope, duration, lead ownership, collaborators, and status."
            actions={<Button onClick={() => handleDialog()} disabled={isLoading} className="bg-lime-500 text-black hover:bg-lime-400"><Plus className="size-4" /> New project</Button>}
        />

        <Dialog open={projForm} onOpenChange={setProjForm}>
            <form>
                <DialogContent className="max-w-xs md:max-w-5xl m-5 lg:m-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Enter the information about your project.
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup className="flex flex-col rounded-md border border-zinc-200 bg-white p-5">
                    <div className="md:flex md:flex-row align-items-center gap-2">
                        <Field className="mb-4 md:mb-0">
                            <Label htmlFor="proj_name" className="text-sm">Project Name <span className="text-red-500">*</span></Label>
                            <div>
                                <Input name="proj_name" className="pb-0" value={projName} placeholder="Enter Project Name" onChange={(e) => setProjName(e.target.value)} required/>
                                {errors.projName && <p className="text-red-500 text-sm mt-1 font-bold">{errors.projName}</p>}
                            </div>
                        </Field>
                        <Field>
                            <Label className="text-sm" htmlFor="proj_loc">Project Location (optional)</Label>
                            <Input name="proj_loc" value={projLoc} placeholder="Project Location" onChange={(e) => setProjLoc(e.target.value)} />
                        </Field>
                    </div>

                    <Field>
                        <Label className="text-sm" htmlFor="details">Project Details <span className="text-red-500 text-base">*</span></Label>
                        <div>
                            <Textarea name="details" value={details} placeholder="Describe The Project" required onChange={(e) => setDetails(e.target.value)}/>
                            {errors.details && <p className="text-red-500 text-sm mt-1 font-bold">{errors.details}</p>}
                        </div>
                        </Field>

                    <div className="md:flex md:flex-row align-items-center gap-2">
                        <Field>
                            <div className="flex flex-row justify-start">
                                <Label className="text-sm" htmlFor="proj_lead">Project Lead <span className="text-red-500 text-base">*</span></Label>
                            </div>
                            <div>
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <Combobox value={selectedUser} name="proj_lead" onValueChange={setSelectedUser}>
                                            <ComboboxInput 
                                                placeholder="Search and select user." 
                                                value={
                                                    selectedUser 
                                                        ? userSelect.find(u => u.user_id === selectedUser)?.f_name + " " + userSelect.find(u => u.user_id === selectedUser)?.l_name
                                                        : searchVal
                                                }
                                                onValueChange={setSearchVal}
                                            />
                                            <ComboboxContent>
                                                <ComboboxList>
                                                    {userDropdownData.length > 0
                                                        ? userDropdownData.map((user) => (
                                                            <ComboboxItem key={user.user_id} value={user.user_id}>
                                                                {user.f_name} {user.l_name} ({user.role})
                                                            </ComboboxItem>
                                                        ))
                                                        :(<ComboboxEmpty>No users yet</ComboboxEmpty>)
                                                    }
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    </div>
                                    {selectedUser && (
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedUser("")}
                                            className="border border-red-500 text-red-700 px-3 h-10 shrink-0"
                                        >
                                            <X/>
                                        </Button>
                                    )}
                                </div>
                                {errors.selectedUser && <p className="text-red-500 text-sm mt-1 font-bold">{errors.selectedUser}</p>}
                            </div>
                        </Field>
                        <Field >
                            <Label className="text-sm" htmlFor="priority_level">Priority Level <span className="text-red-500 text-base">*</span></Label>
                            <div className="max-w-full">
                                <Select  value={priorityLevel} onValueChange={setPriorityLevel}>
                                    <SelectTrigger className="w-full!">
                                        <SelectValue placeholder="Select a fruit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                        <SelectLabel>Priority Level</SelectLabel>
                                        <SelectItem className="text-green-500" value="LOW">LOW</SelectItem>
                                        <SelectItem className="text-yellow-500" value="MID">MID</SelectItem>
                                        <SelectItem className="text-red-500" value="HIGH">HIGH</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.priorityLevel && <p className="text-red-500 text-sm mt-1 font-bold">{errors.priorityLevel}</p>}
                            </div>
                        </Field>
                    </div>

                    <Field className="w-auto">
                        <Label className="text-sm">Project Timeline <span className="text-red-500 text-base">*</span></Label>
                        <div className="flex flex-col md:flex-row w-full align-items-center gap-1">
                            <div className="w-full flex flex-col align-items-center justify-center gap-1">
                                <div className="flex flex-row align-items-center gap-1"> 

                                
                                <Label htmlFor="fromDate">From</Label>
                                <Input name="fromDate" value={fromDate} id="fromDate" type="date" required onChange={(e) => setFromDate(e.target.value)}/>
                                </div>
                                {errors.fromDate && <p className="text-red-500 text-sm mt-1 font-bold">{errors.fromDate}</p>}
                                
                            </div>
                            <div className="w-full flex flex-col align-items-center justify-center gap-1">
                                <div className="flex flex-row align-items-center gap-1"> 
                                <Label htmlFor="toDate">To</Label>
                                <Input type="date" value={toDate} name="toDate" id="toDate" required onChange={(e) => setToDate(e.target.value)}/>
                                </div>
                                {errors.toDate && <p className="text-red-500 text-sm mt-1 font-bold">{errors.toDate}</p>}
                            </div>
                        </div>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose aschild="true">
                    </DialogClose>
                    <Button type="button" onClick={handleReset} className="bg-yellow-500">Reset</Button>
                    <Button type="button" onClick={handleSubmit} className="bg-lime-400">Submit</Button>
                </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>

        
        <ProjectTable dataTable={projectData} onRefresh={fetchProjects} isLoading={isLoading} />
    </div>
  );
}
