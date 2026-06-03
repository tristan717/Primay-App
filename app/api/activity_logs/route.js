import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
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

    if (!userData.user_id || userData.role !== "SYSADMIN") {
      return NextResponse.json({ code: 403, success: false, message: "Unauthorized access." });
    }

    const { data: activities, error: errActivities } = await db
      .from("activity_log")
      .select("*")
      .order("created_at", { descending: true });

    if (errActivities) {
      console.error("Error fetching activities:", errActivities);
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch activities." });
    }

    return NextResponse.json({
      code: 200,
      success: true,
      message: "Activities fetched successfully.",
      activities,
    });
  } catch (error) {
    console.error("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error." });
  }
}