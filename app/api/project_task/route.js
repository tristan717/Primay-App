import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(req){
  try {
    const { userId } = await auth()

    if(!userId){
      return NextResponse.json({code: 500, success: false, message: "Unauthenticated User." })
    }

    const { data: userData, error: errFetch } = await db
    .from("users")
    .select("role, user_id")
    .eq("clerk_user_id", userId)
    .single()

    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if(errFetch || userData.role !== "ADMIN"){
      return NextResponse.json({code: 500, success: false, message: "Unauthorized access." })
    }

    const body = await req.json();
    const payload = body.id

    const { data: projectData, error: errProj } = await db
    .from("project")
    .select("*")
    .eq("project_id", payload)
    .single()

    
    if(errProj){
        console.log("error: ", errProj)
      return NextResponse.json({code: 501, success: false, message: "Failed Request. Project not found."})
    }

    if(projectData){
      console.log("projectData: ", projectData)
      return NextResponse.json({projectData, code: 200, success: true, message: "Project fetched successfully."})
    }

    if(!createdProject && !errInsert){
      return NextResponse.json({ code: 502, success: false, message: "Failed request. No response."})
    }
  } catch (error) {
    console.log("error system: ", error)
    return NextResponse.json({code: 500, success: false, message: "Unknown error failed to fetch project."})
  }
}