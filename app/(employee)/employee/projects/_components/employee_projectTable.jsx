"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AxiosInstance from "@/utils/axios";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployeeProjectTable() {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
  
    async function fetchProjects() {
        try {
            const response = await AxiosInstance.get("/employee/projects");

            if(response){
                if(response.data){
                    const res = response.data;
                    if(res.success === true && res.code === 200){
                        setProjects(res.projectData);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }
    useEffect(() => {
        async function loadProjects() {
            await fetchProjects();
        }
        loadProjects();
    }, []);


    const filteredProjects = useMemo(() => {
        if (!Array.isArray(projects)) return [];

        return projects.filter((project) => {
            const searchLower = (searchQuery || "").toLowerCase();
            return (
            (project.project_name || "").toLowerCase().includes(searchLower) ||
            (project.desc || "").toLowerCase().includes(searchLower)
            );
        });
    }, [projects, searchQuery]);
    

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredProjects.slice(startIndex, endIndex);
    }, [filteredProjects, currentPage, pageSize]);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on search
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "LOW":
                return <Badge className="p-1 w-15 rounded-lg border border-green-500 bg-green-500/30 text-green-700">Low</Badge>;
            case "MID":
                return <Badge className="p-1 w-15 rounded-lg border border-yellow-500 bg-yellow-500/30 text-yellow-700">Mid</Badge>;
            case "HIGH":
                return <Badge className="p-1 w-15 rounded-lg border border-red-500 bg-red-500/30 text-red-700">High</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };
  return (
    <div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search project name or description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {paginatedProjects.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-lime-400/50">
              <TableRow>
                <TableHead className="text-black font-semibold">Project Name</TableHead>
                <TableHead className="text-black font-semibold">Priority</TableHead>
                <TableHead className="text-black font-semibold">Project Lead</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.map((project) => (
                <TableRow key={project.project_id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{project.project_name || "N/A"}</TableCell>
                  <TableCell>
                    {getPriorityColor(project.priority)}
                  </TableCell>
                  <TableCell>{project.lead_name || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-gray-500">No projects found.</p>
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
