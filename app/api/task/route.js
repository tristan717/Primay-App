import { logActivity } from "@/lib/activityLogger";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

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
      .select("role, user_id")
      .eq("clerk_user_id", userId)
      .single();
  
    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (errUser || userData?.role !== "ADMIN") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const { data: projectData, error: errProject } = await db
      .from("project")
      .select("status")
      .eq("project_id", projectId)
      .eq("created_by", userData.user_id)
      .single();

    if (errProject || !projectData) {
      return NextResponse.json({ code: 404, success: false, message: "Project not found." });
    }


    const { data: tasks, error: errTasks } = await db
      .from("task")
      .select("*")
      .eq("project_id", projectId)
      .eq("created_by", userData.user_id)
      .eq("archive_status", "FALSE")
      .order("created_at", { descending: true });

    if (errTasks) {
      console.log("Error fetching tasks:", errTasks);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch tasks." });
    }

    if (!errTasks && !tasks) {
      console.log("You have not created tasks yet:", errTasks, " ", tasks);
      return NextResponse.json({ code: 300, success: false, message: "You have not created tasks yet." });
    }

    return NextResponse.json({
      tasks: tasks || [],
      projectData,
      code: 200,
      success: true,
      message: "Tasks fetched successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error failed to fetch tasks." });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, f_name, l_name, position, department")
      .eq("clerk_user_id", userId)
      .single();

    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (errUser || userData?.role !== "ADMIN") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const body = await req.json();
    const payload = body.payload;
    const { task_name, task_details, deadline, task_loc, user_id_employee, project_id } = payload;

    // Validate required fields
    if (!task_name || !task_details || !deadline || !user_id_employee || !project_id) {
      return NextResponse.json({ code: 400, success: false, message: "Missing required fields." });
    }

    // Fetch employee name
    const { data: employeeData, error: errEmployee } = await db
      .from("users")
      .select("f_name, l_name")
      .eq("user_id", user_id_employee)
      .single();

    if (errEmployee) {
      return NextResponse.json({ code: 500, success: false, message: "Failed to find employee." });
    }

    const employeeName = `${employeeData.f_name} ${employeeData.l_name}`;
    const creatorName = `${userData.f_name} ${userData.l_name}`;

    // Fetch project name
    const { data: projectData, error: errProject } = await db
      .from("project")
      .select("project_name")
      .eq("project_id", project_id)
      .single();

    if (errProject) {
      return NextResponse.json({ code: 500, success: false, message: "Failed to find project." });
    }

    // Create task
    const { data: createdTask, error: errInsert } = await db
      .from("task")
      .insert({
        task_name: task_name,
        task_details: task_details,
        deadline: deadline,
        task_loc: task_loc,
        user_id_employee: user_id_employee,
        employee_name: employeeName,
        project_id: project_id,
        project_name: projectData.project_name,
        created_by: userData.user_id,
        creator_name: creatorName,
      })
      .select()
      .single();

    if (errInsert) {
      console.log("Error inserting task:", errInsert);
      return NextResponse.json({ code: 500, success: false, message: "Failed to create task." });
    }

    const clientIp = getClientIp(req);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: "Task Created",
      method: "POST",
      ipAdd: clientIp,
      activityJson: {
        projectId: createdTask.project_id,
        data: JSON.stringify(createdTask)
      },
    });
    revalidatePath(`/admin/projects/${project_id}`);
    return NextResponse.json({
      code: 200,
      success: true,
      message: "Task created successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error failed to create task." });
  }
}
