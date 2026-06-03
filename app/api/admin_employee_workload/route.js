import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function getFullName(user) {
  return [user?.f_name, user?.l_name].filter(Boolean).join(" ") || "Unnamed";
}

function getShortName(user) {
  const first = user?.f_name || "";
  const last = user?.l_name || "";
  const lastInitial = last ? `${last.charAt(0)}.` : "";

  return [first, lastInitial].filter(Boolean).join(" ") || "Unnamed";
}

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json({ code: 400, success: false, message: "Project ID is required." });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, department")
      .eq("clerk_user_id", userId)
      .single();

    if (errUser || !userData?.user_id) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (userData.role !== "ADMIN") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const { data: projectData, error: errProject } = await db
      .from("project")
      .select("project_id, project_name")
      .eq("project_id", projectId)
      .eq("created_by", userData.user_id)
      .single();

    if (errProject || !projectData) {
      return NextResponse.json({ code: 404, success: false, message: "Project not found." });
    }

    if (!errProject && !projectData) {
      return NextResponse.json({ code: 404, success: false, message: "Create projects and tasks and assign them to employees." });
    }

    const { data: employees, error: errEmployees } = await db
      .from("users")
      .select("user_id, f_name, l_name, email, role, position, department")
      .eq("department", userData.department)
      .neq("user_id", userData.user_id)
      .order("f_name", { ascending: true });

    if (errEmployees) {
      console.log("Error fetching employees for workload:", errEmployees);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch employees." });
    }

    const { data: tasks, error: errTasks } = await db
      .from("task")
      .select("task_id, user_id_employee, employee_name, task_status")
      .eq("project_id", projectId)
      .eq("created_by", userData.user_id)
      .eq("archive_status", false);

    if (errTasks) {
      console.log("Error fetching tasks for workload:", errTasks);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch task workload." });
    }

    const countsByEmployee = new Map();

    for (const task of tasks || []) {
      const employeeId = task.user_id_employee;
      const current = countsByEmployee.get(employeeId) || {
        pendingCount: 0,
        doneCount: 0,
        totalCount: 0,
      };

      if (task.task_status === "DONE") {
        current.doneCount += 1;
      }

      if (task.task_status === "PENDING") {
        current.pendingCount += 1;
      }

      current.totalCount += 1;
      countsByEmployee.set(employeeId, current);
    }

    const chartEmployees = (employees || []).map((employee) => {
      const counts = countsByEmployee.get(employee.user_id) || {
        pendingCount: 0,
        doneCount: 0,
        totalCount: 0,
      };

      return {
        ...employee,
        fullName: getFullName(employee),
        shortName: getShortName(employee),
        pendingCount: counts.pendingCount,
        doneCount: counts.doneCount,
        totalCount: counts.totalCount,
      };
    });

    return NextResponse.json({
      code: 200,
      success: true,
      project: projectData,
      employees: chartEmployees,
      totalTasks: tasks?.length || 0,
      message: "Employee workload fetched successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to fetch workload." });
  }
}
