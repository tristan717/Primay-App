import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, department")
      .eq("clerk_user_id", userId)
      .single();
    
    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (errUser || userData?.role !== "ADMIN") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const { searchParams } = new URL(req.url);
    console.log("searchParams ", searchParams)
    const id = searchParams.get("id");
    console.log("payloadza: ", id)

    const { data:employeeData, error:errEmployee } = await db
    .from("users")
    .select("*")
    .eq("department", userData.department)
    .eq("user_id", id)
    .single();

    if(errEmployee){
      console.log("error fetch employee: ", errEmployee)
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch employees." });
    }

    if(!errEmployee && !employeeData){
      return NextResponse.json({ code: 300, success: false, message: "Employee not found." });
    }

    console.log("employeeData: ", employeeData)
    const emp_id = employeeData.user_id
    const { data: employeeTasks, error:empTaskErr } = await db
    .from("task")
    .select("*")
    .eq("user_id_employee", emp_id)
    .eq("archive_status", false)

    if (empTaskErr) {
      console.error("Error fetching employee tasks:", empTaskErr);
      return NextResponse.json({ 
        code: 500, 
        success: false, 
        message: "Failed to fetch employee tasks." 
      });
    }

    if (!empTaskErr && !employeeTasks) {
      return NextResponse.json({ 
        code: 500, 
        success: false, 
        message: "No tasks found. Assign tasks to this employee." 
      });
    }

    let projData = [];

    // Extract unique project IDs from tasks
    if (employeeTasks && employeeTasks.length > 0) {
      const projectIds = [
        ...new Set(employeeTasks.map(task => task.project_id).filter(Boolean))
      ];


      // Fetch all projects related to this employee's tasks
      if (projectIds.length > 0) {
        const { data: projects, error: projErr } = await db
          .from("project")
          .select("*")
          .in("project_id", projectIds);

        if (projErr) {
          console.error("Error fetching projects:", projErr);
          return NextResponse.json({ 
            code: 500, 
            success: false, 
            message: "Failed to fetch project data." 
          });
        }

        console.log("projects: ", projects)

        if(!projects && !projErr){
          projData = [];
        }
        projData = projects;
      }
    }


    return NextResponse.json({
      data: {
        employeeData,
        tasks: employeeTasks || [],
        projects: projData,
      },
      code: 200,
      success: true,
      message: "Employees fetched successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to fetch employee data." });
  }
}