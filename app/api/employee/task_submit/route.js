import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientIp } from "@/utils/getClientIp";
import { logActivity } from "@/lib/activityLogger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
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
    
    if (!userData.user_id) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (errUser || userData?.role !== "EMPLOYEE") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const taskId = formData.get("taskId");

    if (!file || !taskId) {
      return NextResponse.json({ code: 400, success: false, message: "File and Task ID are required." });
    }

    // File type validation
    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.type);
    const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension);
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (!isValidMimeType || !isValidExtension) {
      return NextResponse.json({
        code: 400,
        success: false,
        message: "Invalid file type. Only PDF, Word documents (.doc, .docx), JPG, and PNG files are allowed.",
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        code: 400,
        success: false,
        message: `File size exceeds the maximum limit of 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
      });
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

    if(task.archive_status === true){
        return NextResponse.json({ code: 403, success: false, message: "Cannot submit. The task your are submitting to is already archived." });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `submissions/${taskId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("task_submitted")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error("Error uploading file:", uploadErr);
      return NextResponse.json({ code: 500, success: false, message: "Failed to upload file." });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("task_submitted")
      .getPublicUrl(filePath);



    const employ_name = `${userData.f_name} ${userData.l_name}`
    // Create submission record in database
    const { data:submittedTask, error: submitErr } = await db
      .from("task_submission")
      .insert({
        task_id: taskId,
        task_name: task.task_name,
        user_id_employee: userData.user_id,
        employee_name: employ_name,
        project_id: task.project_id,
        project_name: task.project_name,
        deadline: task.deadline,
        file_url: publicUrl,
        file_name: file.name,
        submission_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (submitErr) {
      console.error("Error creating submission record:", submitErr);
      return NextResponse.json({ code: 500, success: false, message: "Failed to submit." });
    }

    if(!submittedTask){
      return NextResponse.json({ code: 500, success: false, message: "Failed to submit." });
    }

    const { data: updatedTask, error: updateErr } = await db
      .from("task")
      .update({ task_status: "DONE" })
      .eq("task_id", taskId)
      .select()
      .single();

    if (updateErr) {
      console.error("Error updating task status:", updateErr);
      return NextResponse.json({ code: 500, success: false, message: "Failed to update task status." });
    }

    if(!updatedTask && !updateErr){
      return NextResponse.json({ code: 500, success: false, message: "Task not found." });
    }

    const clientIp = getClientIp(request);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: "Submitted Task",
      method: "POST",
      ipAdd: clientIp,
      fileName: file.name,
      fileType: file.type,
      fileUrl: publicUrl,
      activityJson: {
        submitted_file_id: submittedTask.submission_id,
        submitted_data: JSON.stringify(submittedTask),
        beforeData: JSON.stringify(task),
        updatedData: JSON.stringify(updatedTask)
      },
    });

    return NextResponse.json({
      code: 200,
      success: true,
      message: "File submitted successfully.",
      data: {
        filePath,
        fileName: file.name,
      },
    });

  } catch (error) {
    console.error("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to submit file." });
  }
}