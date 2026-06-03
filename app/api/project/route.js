import { logActivity } from "@/lib/activityLogger";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(){
  try {
    const { userId } = await auth()

    const { data: userData, error: errFetch } = await db
    .from("users")
    .select("role, user_id, clerk_user_id")
    .eq("clerk_user_id", userId)
    .single()

    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if(userData.role !== "ADMIN"){
      return NextResponse.json({code: 500, success: false, message: "Unauthorized access." })
    }
    if(errFetch){
      return NextResponse.json({code: 500, success: false, message: "Failed Request." })
    }

    const { data:dataProject, error:errFetchProj } = await db
    .from("project")
    .select('*')
    .eq("created_by", userData.user_id)
    .eq("archive_status", "FALSE")
    .order('createdAt', { descending: true })

    if(errFetchProj){
        console.log("error fetching: ", errFetchProj)
        return NextResponse.json({code: 500, success: false, message:"Unknown error failed to fetch project."})
    }

    if(dataProject){
        return NextResponse.json({dataProject, code: 200, success: true, message:"Success fetching data."})
    }

  } catch (error) {
    console.log("error system: ", error)
    return NextResponse.json({code: 500, success: false, message:"Unknown error failed to fetch."})
  }
}

export async function POST(req){
  try {
    const { userId } = await auth()

    if(!userId){
      return NextResponse.json({code: 500, success: false, message: "Unauthenticated User." })
    }

    const { data: userData, error: errFetch } = await db
    .from("users")
    .select("role, user_id, clerk_user_id, f_name, l_name, position, department")
    .eq("clerk_user_id", userId)
    .single()

    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }
    
    if(errFetch || userData.role !== "ADMIN"){
      return NextResponse.json({code: 500, success: false, message: "Unauthorized access." })
    }

    const body = await req.json();
    const payload = body.payload
    console.log("body: ", body)
    const { proj_name, proj_loc, details, proj_lead, priority_level, fromDate, toDate } = payload;

    console.log("lead id b4 qry: ", proj_lead)
    const { data: leadData, error: errLead } = await db
    .from("users")
    .select("f_name, l_name")
    .eq("user_id", proj_lead)
    .single()

    
    if(errLead){
      return NextResponse.json({code: 500, success: false, message: "Failed to create project. Can't find selected lead."})
    }

    let leadName = "";
    if(leadData){
      leadName = leadData.f_name + " " + leadData.l_name
    }

    const { data: createdProject, error: errInsert } = await db
    .from("project")
    .insert({
      project_name: proj_name,
      project_loc: proj_loc,
      desc: details,
      user_lead_id: proj_lead,
      lead_name: leadName,
      priority: priority_level,
      duration_from: fromDate,
      duration_to: toDate,
      created_by: userData.user_id
    })
    .select()
    .single()

    if(errInsert){
      console.log("errIns: ", errInsert)
      return NextResponse.json({code: 500, success: false, message: "Failed to create project."})
    }

    if(createdProject){
      const clientIp = getClientIp(req);
      await logActivity({
        userId: userData.user_id,
        userName: `${userData.f_name} ${userData.l_name}`,
        role: userData.role,
        position: userData.position,
        department: userData.department,
        activityName: "Project Created",
        method: "POST",
        ipAdd: clientIp,
        activityJson: {
          projectId: createdProject.project_id,
          data: JSON.stringify(createdProject)
        },
      });
      return NextResponse.json({ code: 200, success: true, message: "Project created successfully."})
    }

    if(!createdProject && !errInsert){
      return NextResponse.json({ code: 500, success: false, message: "Failed request. No response."})
    }
  } catch (error) {
    console.log("error system: ", error)
    return NextResponse.json({code: 500, success: false, message: "Unknown error failed to create project."})
  }
}


export async function PUT(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        code: 500,
        success: false,
        message: "Unauthenticated User.",
      });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, f_name, l_name, position, department")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData?.user_id || errUser) {
      return NextResponse.json({
        code: 500,
        success: false,
        message: "Unauthenticated User.",
      });
    }

    if (userData.role !== "ADMIN") {
      return NextResponse.json({
        code: 500,
        success: false,
        message: "Unauthorized access.",
      });
    }

    const body = await req.json();
    const { projectId, action, projectName } = body;

    if (!projectId || !action) {
      return NextResponse.json({
        code: 400,
        success: false,
        message: "Project ID and action are required.",
      });
    }

    // Verify project belongs to this user
    const { data: project, error: errProject } = await db
      .from("project")
      .select("*")
      .eq("project_id", projectId)
      .eq("created_by", userData.user_id)
      .single();

    if (errProject || !project) {
      return NextResponse.json({
        code: 404,
        success: false,
        message: "Project not found.",
      });
    }

    if (!errProject && !project) {
      return NextResponse.json({
        code: 404,
        success: false,
        message: "Project not found.",
      });
    }
    // Update based on action
    let updateData = {};

    if (action === "finish") {
      updateData = { status: true };
    } else if (action === "archive") {
      updateData = { archive_status: true };
    } else {
      return NextResponse.json({
        code: 400,
        success: false,
        message: "Invalid action.",
      });
    }

    const { data: updatedProject, error: errUpdate } = await db
      .from("project")
      .update(updateData)
      .eq("project_id", projectId)
      .select()
      .single();

    if (errUpdate) {
      console.error("Error updating project:", errUpdate);
      return NextResponse.json({
        code: 500,
        success: false,
        message: "Failed to update project.",
      });
    }

    const actionLabel = action === "finish" ? "marked as finished" : "archived";
    const clientIp = getClientIp(req);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: actionLabel === "finish" ? "Marked as Project Finished": "Project Archived",
      method: "PUT",
      ipAdd: clientIp,
      activityJson: {
        projectId: updatedProject.project_id,
        beforeData: JSON.stringify(project),
        changesMade: JSON.stringify(updatedProject), // whatever fields were changed
      },
    });
    return NextResponse.json({
      code: 200,
      success: true,
      message: `Project ${actionLabel} successfully.`,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error system:", error);
    return NextResponse.json({
      code: 500,
      success: false,
      message: "Unknown error failed to update project.",
    });
  }
}