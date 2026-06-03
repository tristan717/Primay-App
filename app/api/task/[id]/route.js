import { logActivity } from "@/lib/activityLogger";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
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

    const { id: taskId } = await params;
    const body = await req.json();
    const payload = body.payload;
    const { task_name, task_details, deadline, task_loc, user_id_employee } = payload;

    const { data: task, error: errTask } = await db
      .from("task")
      .select("*")
      .eq("task_id", taskId)
      .single();
      
    if (errTask || !task) {
      return NextResponse.json({ code: 404, success: false, message: "Task not found." });
     }

    // Validate required fields
    if (!task_name || !task_details || !deadline || !user_id_employee) {
      return NextResponse.json({ code: 400, success: false, message: "Missing required fields." });
    }

    // Fetch employee name for update
    const { data: employeeData, error: errEmployee } = await db
      .from("users")
      .select("f_name, l_name")
      .eq("user_id", user_id_employee)
      .single();

    if (errEmployee) {
      return NextResponse.json({ code: 500, success: false, message: "Failed to find employee." });
    }

    const employeeName = `${employeeData.f_name} ${employeeData.l_name}`;

    // Update task
    const { data: updatedTask, error: errUpdate } = await db
      .from("task")
      .update({
        task_name: task_name,
        task_details: task_details,
        deadline: deadline,
        task_loc: task_loc,
        user_id_employee: user_id_employee,
        employee_name: employeeName,
      })
      .eq("task_id", taskId)
      .select()
      .single();

    if (errUpdate) {
      console.log("Error updating task:", errUpdate);
      return NextResponse.json({ code: 500, success: false, message: "Failed to update task." });
    }

    const clientIp = getClientIp(req);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: "Task Updated",
      method: "PUT",
      ipAdd: clientIp,
      activityJson: {
        projectId: updatedProject.project_id,
        beforeData: JSON.stringify(task),
        updatedData: JSON.stringify(updatedTask), // whatever fields were changed
      },
    });

    const projectId = updatedTask.project_id;
    revalidatePath(`/admin/projects/${projectId}`);
    return NextResponse.json({
      code: 200,
      success: true,
      message: "Task updated successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error failed to update task." });
  }
}
