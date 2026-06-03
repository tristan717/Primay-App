"use client";

import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
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
import AxiosInstance from "@/utils/axios";
import {
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import EmployeeChart from "./_components/employeeChart";
import { useRouter } from "next/navigation";
import DecisionSupport from "./_components/decisionSupport";


const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getFullName(employee) {
  return [employee?.f_name, employee?.l_name].filter(Boolean).join(" ") || "Not set";
}

function getDisplayValue(value) {
  return value || "Not set";
}

export default function AdminUsersPage() {
  const [employeeArr, setEmployeeArr] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();

  useEffect(() => {
    async function fetchEmployees(){
      const response = await AxiosInstance.get("/admin_employee");
      if(response){
        if(response.data){
          const res = response.data;
          if(res.code === 200 && res.success === true){
            setEmployeeArr(res.employeeData)
          }
        }
      }
    }
    fetchEmployees();
  }, []);

  console.log("employeeArr", employeeArr)

  const filteredEmployees = useMemo(() => {
    const keyword = normalizeText(search);

    if (!keyword) return employeeArr;

    return employeeArr.filter((employee) =>
      normalizeText(getFullName(employee)).includes(keyword)
    );
  }, [employeeArr, search]);

  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const updateSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updatePageSize = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Employee monitoring"
        title="Employee Workload"
        description="Primary aims for their clients to take care of their employees by giving workloads fairly. View assigned task volume, overdue work, and capacity signals for fair workload balancing."
      />

      <EmployeeChart />

      <div className="mb-5 max-w-xs">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search employee name"
          />
          <InputGroupAddon align="inline-end">
            {filteredEmployees.length} employee{filteredEmployees.length === 1 ? "" : "s"}
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-mist-500/20 hover:bg-mist-500/20">
            <TableHead className="text-black">Fullname</TableHead>
            <TableHead className="text-black">Role</TableHead>
            <TableHead className="text-black">Position</TableHead>
            <TableHead className="text-black">Email</TableHead>
            <TableHead className="text-center text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white/50">
          {paginatedEmployees.map((employee) => (
              <TableRow key={employee.user_id} className="hover:bg-gray-50">
                <TableCell className="min-w-52 font-medium text-gray-950 capitalize">
                  {getFullName(employee)}
                </TableCell>
                <TableCell className="min-w-32">{getDisplayValue(employee.role)}</TableCell>
                <TableCell className="min-w-40">
                  {getDisplayValue(employee.position)}
                </TableCell>
                <TableCell className="min-w-64">{getDisplayValue(employee.email)}</TableCell>
                <TableCell className="min-w-32 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    aria-label={`View ${getFullName(employee)}`}
                    onClick={() => router.push(`/admin/users/${employee.user_id}`)}
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}

          {paginatedEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="mx-auto max-w-sm">
                  <p className="font-medium text-gray-900">No employees found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting the employee name search.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">
            {filteredEmployees.length ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900">
            {Math.min(startIndex + pageSize, filteredEmployees.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">
            {filteredEmployees.length}
          </span>{" "}
          employees
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={String(pageSize)} onValueChange={updatePageSize}>
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

        <DecisionSupport employeeData={employeeArr} />
    </div>
  );
}
