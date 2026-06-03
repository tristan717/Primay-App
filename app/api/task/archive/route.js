import { logActivity } from "@/lib/activityLogger";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(req) {
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
    const { id } = body;

    const { data: task, error: errTask } = await db
      .from("task")
      .select("*")
      .eq("task_id", id)
      .single();

    if(!task){
      return NextResponse.json({ code: 404, success: false, message: "Task not found." });
    }

    if(!task && !errTask){
      return NextResponse.json({ code: 404, success: false, message: "Task do not exist." });
    }
    // Update task
    const { data: updatedTask, error: errUpdate } = await db
      .from("task")
      .update({ archive_status: "TRUE" })
      .eq("task_id", id)
      .select()
      .single();

    if (errUpdate) {
      console.log("Error updating task:", errUpdate);
      return NextResponse.json({ code: 500, success: false, message: "Failed to archive task." });
    }

    if (!errUpdate && !updatedTask) {
      console.log("You have not archive tasks yet:", updatedTask, " ", errUpdate);
      return NextResponse.json({ code: 300, success: false, message: "Task to archive not found." });
    }

    const clientIp = getClientIp(req);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: "Archived Task",
      method: "PUT",
      ipAdd: clientIp,
      activityJson: {
        projectId: updatedProject.project_id,
        beforeData: JSON.stringify(task),
        updatedData: JSON.stringify(updatedTask), // whatever fields were changed
      },
    });


    revalidatePath('/admin/task')
    return NextResponse.json({
      code: 200,
      success: true,
      message: "Task archived successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error failed to archive task." });
  }
}
