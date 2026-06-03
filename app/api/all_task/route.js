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

    if (errUser || userData?.role !== "ADMIN") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const { data: tasks, error: errTasks } = await db
      .from("task")
      .select("*")
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
      tasks,
      code: 200,
      success: true,
      message: "Tasks fetched successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to fetch tasks." });
  }
}