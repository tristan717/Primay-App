import { db } from "@/utils/dbServer";
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
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized action." });
    }


    const { data: taskData, error: errTask } = await db
    .from("task")
    .select("project_id")
    .eq("user_id_employee", userData.user_id)
    
    if (errTask) {
      console.error("Error fetching project data:", errTask);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch project data." });
    }

    console.log("taskData: ", taskData);

    if(!errTask && !taskData){
      return NextResponse.json({ code: 500, success: false, message: "Task not found." });
    }

    const uniqueProjectIds = [...new Set(taskData.map(task => task.project_id).filter(Boolean))];

    if (uniqueProjectIds.length === 0) {
        return NextResponse.json({ code: 200, success: true, message: "No projects found.", projects: [] });
    }

    console.log("uniqueProjectIds: ", uniqueProjectIds);
    const { data: projectData, error: errProject } = await db
      .from("project")
      .select("project_id, project_name, priority, lead_name")
      .in("project_id", uniqueProjectIds)
      .neq("archive_status", "TRUE");
    
      console.log("errProject: ", errProject);

    console.log("projectData: ", projectData);

    if (errProject) {
      console.error("Error fetching project data:", errProject);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch project data." });
    }

    if(!errProject && !projectData){
      return NextResponse.json({ code: 500, success: false, message: "Project not found." });
    }

    return NextResponse.json({ code: 200, success: true, message: "Projects fetched successfully.", projectData });

  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to update task." });
  }
}