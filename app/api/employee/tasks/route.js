import { logActivity } from "@/lib/activityLogger";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id")
      .eq("clerk_user_id", userId)
      .single();
    
    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (errUser || userData?.role !== "EMPLOYEE") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const { data: tasks, error: errTasks } = await db
      .from("task")
      .select("*")
      .eq("user_id_employee", userData.user_id)
      .eq("archive_status", "FALSE")
      .order("created_at", { descending: true });

    if (errTasks) {
      console.log("Error fetching tasks:", errTasks);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch tasks." });
    }

    if (!errTasks && !tasks) {
      return NextResponse.json({ code: 300, success: false, message: "No assigned tasks yet." });
    }

    const projectIds = [...new Set(tasks.map(task => task.project_id).filter(Boolean))];

    const { data: projects, error: errProjects } = await db
      .from("project")
      .select("project_id, project_name, priority")
      .in("project_id", projectIds);

    if (errProjects) {
      console.error("Error fetching projects:", errProjects);
      // Still return tasks even if projects fail
      return NextResponse.json({
        tasks,
        code: 200,
        success: true,
        message: "Tasks fetched successfully (project data unavailable).",
      });
    }

    const projectMap = {};
    (projects || []).forEach(project => {
      projectMap[project.project_id] = project;
    });


    const enrichedTasks = tasks.map(task => ({
      ...task,
      project: projectMap[task.project_id] || null,
    }));

    return NextResponse.json({
      tasks: enrichedTasks,
      code: 200,
      success: true,
      message: "Tasks fetched successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to fetch tasks." });
  }
}

export async function PUT(request) {
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

    if (errUser || userData?.role !== "EMPLOYEE") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized action." });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const body = await request.json();
    const { action } = body;

    if (!taskId) {
      return NextResponse.json({ code: 400, success: false, message: "Task not found." });
    }

    // Verify task belongs to employee
    const { data: task, error: errTask } = await db
      .from("task")
      .select("*")
      .eq("task_id", taskId)
      .single();

    if (errTask || !task || task.user_id_employee !== userData.user_id) {
      return NextResponse.json({ code: 403, success: false, message: "Unauthorized: Task does not belong to you." });
    }

    if (action === "mark_read") {
      const { data:taskUpdated, error: updateErr } = await db
        .from("task")
        .update({ received_employee: true })
        .eq("task_id", taskId)
        .select()
        .single();

      if (updateErr) {
        console.error("Error updating task:", updateErr);
        return NextResponse.json({ code: 500, success: false, message: "Failed to update task." });
      }

      const clientIp = getClientIp(request);
      await logActivity({
        userId: userData.user_id,
        userName: `${userData.f_name} ${userData.l_name}`,
        role: userData.role,
        position: userData.position,
        department: userData.department,
        activityName: "Marked Task as Read",
        method: "PUT",
        ipAdd: clientIp,
        activityJson: {
          projectId: taskId,
          beforeData: JSON.stringify(task),
          updatedData: JSON.stringify(taskUpdated)
        },
      });

      return NextResponse.json({
        code: 200,
        success: true,
        message: "Task marked as read successfully.",
      });
    }

    return NextResponse.json({ code: 400, success: false, message: "Invalid action." });

  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to update task." });
  }
}