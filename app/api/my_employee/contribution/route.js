import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ 
        code: 500, 
        success: false, 
        message: "Unauthenticated User." 
      });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id")
      .eq("clerk_user_id", userId)
      .single();

    if (errUser || !userData?.user_id) {
      return NextResponse.json({ 
        code: 500, 
        success: false, 
        message: "Unauthenticated User." 
      });
    }

    if (userData.role !== "ADMIN") {
      return NextResponse.json({ 
        code: 500, 
        success: false, 
        message: "Unauthorized User." 
      });
    }

    const { searchParams } = new URL(req.url);
    const projectIds = searchParams.get("project_ids")?.split(",") || [];

    if (projectIds.length === 0) {
      return NextResponse.json({ 
        code: 400, 
        success: false, 
        message: "Project IDs are required." 
      });
    }

    // Fetch total tasks for each project
    const { data: projectTasks, error: errTasks } = await db
      .from("task")
      .select("project_id, task_status, project_name")
      .in("project_id", projectIds)
      .eq("archive_status", false);

    if (errTasks) {
      console.error("Error fetching project tasks:", errTasks);
      return NextResponse.json({ 
        code: 500, 
        success: false, 
        message: "Failed to fetch project task counts." 
      });
    }

    // Group tasks by project
    const taskCounts = {};
    projectIds.forEach(id => {
      taskCounts[id] = {
        totalTasks: 0,
        completedTasks: 0,
      };
    });

    (projectTasks || []).forEach((task) => {
      if (taskCounts[task.project_id]) {
        taskCounts[task.project_id].totalTasks += 1;
        if (task.task_status === "DONE") {
          taskCounts[task.project_id].completedTasks += 1;
        }
      }
    });

    return NextResponse.json({
      code: 200,
      success: true,
      taskCounts,
      message: "Project task counts fetched successfully.",
    });
  } catch (error) {
    console.error("Error system:", error);
    return NextResponse.json({ 
      code: 500, 
      success: false, 
      message: "Unknown error, failed to fetch project task counts." 
    });
  }
}