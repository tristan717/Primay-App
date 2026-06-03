import { NextResponse } from "next/server";
import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";


export async function GET() {
    try{
        const { userId } = await auth();

        if(!userId){
            return NextResponse.json({code: 500, message: "Unauthenticated User", success: false});
        }

        const {data: userData, error: userErr} = await db
        .from("users")
        .select("f_name, l_name, role, position, user_id, org_id")
        .eq("clerk_user_id", userId)
        .maybeSingle()

        if(userErr){
            return NextResponse.json({ code: 500, message: "Failed to verify", success: false });
        }

        if(!userData.user_id){
            return NextResponse.json({ code: 404, message: "Unauthenticated user", success: false });
        }

       if(userData.role !== "SYSADMIN"){
            return NextResponse.json({ code: 404, message: "Unauthorized user", success: false });
        }

        const { data: users, error: usersErr } = await db
        .from("users")
        .select("*")
        .eq("org_id", userData.org_id)

        if(usersErr){
            console.log(usersErr)
            return NextResponse.json({ code: 500, message: "Failed to fetch users", success: false });
        }

        if(!users && !usersErr){
            return NextResponse.json({ code: 404, message: "No users found", success: false });
        }

        return NextResponse.json({users, code: 200, message: "Successful", success: true });
    } catch(error){
        console.log("Error fetching users");
        return NextResponse.json({code: 500, message: "Internal Server Error", success: false})
    }
}


export async function POST() {
    try{
        const { userId } = await auth();

        if(!userId){
            return NextResponse.json({code: 500, message: "Unauthenticated User", success: false});
        }

        const {data: userData, error: userErr} = await db
        .from("users")
        .select("f_name, l_name, role, position, user_id, org_id")
        .eq("clerk_user_id", userId)
        .maybeSingle()

        if(userErr){
            return NextResponse.json({ code: 500, message: "Failed to verify", success: false });
        }

        if(!userData.user_id){
            return NextResponse.json({ code: 404, message: "Unauthenticated user", success: false });
        }

       if(userData.role !== "SYSADMIN"){
            return NextResponse.json({ code: 404, message: "Unauthorized user", success: false });
        }

        const { data: users, error: usersErr } = await db
        .from("users")
        .select("*")
        .eq("org_id", userData.org_id)

        if(usersErr){
            console.log(usersErr)
            return NextResponse.json({ code: 500, message: "Failed to fetch users", success: false });
        }

        if(!users && !usersErr){
            return NextResponse.json({ code: 404, message: "No users found", success: false });
        }

        return NextResponse.json({users, code: 200, message: "Successful", success: true });
    } catch(error){
        console.log("Error fetching users");
        return NextResponse.json({code: 500, message: "Internal Server Error", success: false})
    }
}


import { logActivity } from "@/lib/activityLogger";
import { getClientIp } from "@/utils/getClientIp";

export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, f_name, l_name, position, department, org_id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData?.user_id || userData.role !== "SYSADMIN") {
      return NextResponse.json({ code: 403, success: false, message: "Unauthorized access." });
    }

    const body = await request.json();
    const { action, userId: targetUserId, data } = body;

    if (!targetUserId) {
      return NextResponse.json({ code: 400, success: false, message: "Target user ID is required." });
    }

    // BAN USER
    if (action === "ban_user") {
      const { data: targetUser, error:banErr } = await db
        .from("users")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("org_id", userData.org_id)
        .single();
    
        if(banErr){
            return NextResponse.json({code: 500, success: false, message: "User to ban not found."})
        }

      const newStatus = !targetUser?.user_status; // Toggle ban status

      const { data:bannedUser, error: updateErr } = await db
        .from("users")
        .update({ user_status: newStatus, updatedAt: new Date() })
        .eq("user_id", targetUserId)
        .select()
        .single();

      if (updateErr) {
        console.error("Error updating user status:", updateErr);
        return NextResponse.json({ code: 500, success: false, message: "Failed to update user status." });
      }

      const clientIp = getClientIp(request);
      await logActivity({
        userId: userData.user_id,
        userName: `${userData.f_name} ${userData.l_name}`,
        role: userData.role,
        position: userData.position,
        department: userData.department,
        activityName: newStatus ? "User Banned" : "User Unbanned",
        method: "PUT",
        ipAdd: clientIp,
        activityJson: {
          user_id: targetUserId,
          beforeUpdate: JSON.stringify(targetUser),
          updatedData: JSON.stringify(bannedUser)
        }
      });

      return NextResponse.json({
        code: 200,
        success: true,
        message: `User ${newStatus ? "banned" : "unbanned"} successfully.`,
      });
    }

    // UPDATE USER
    if (action === "update_user") {
      if (!data) {
        return NextResponse.json({ code: 400, success: false, message: "Update data is required." });
      }

      const { f_name, l_name, email, position, role } = data;

      if (!f_name || !l_name || !email || !role) {
        return NextResponse.json({ code: 400, success: false, message: "Missing required fields." });
      }

      // Get original data for comparison
      const { data: originalUser, error:checkErr } = await db
        .from("users")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

        if(checkErr){
            return NextResponse.json({ code: 400, success: false, message: "Cannot find user to update." });
        }
      const { data:updatedUser, error: updateErr } = await db
        .from("users")
        .update({
          f_name,
          l_name,
          email,
          position,
          role,
          updatedAt: new Date()
        })
        .eq("user_id", targetUserId)
        .select()
        .single();

      if (updateErr) {
        console.error("Error updating user:", updateErr);
        return NextResponse.json({ code: 500, success: false, message: "Failed to update user." });
      }

      const clientIp = getClientIp(request);
      await logActivity({
        userId: userData.user_id,
        userName: `${userData.f_name} ${userData.l_name}`,
        role: userData.role,
        position: userData.position,
        department: userData.department,
        activityName: "User Updated",
        method: "PUT",
        ipAdd: clientIp,
        activityJson: {
          userId:targetUserId,
          beforeUpdate: JSON.stringify(originalUser),
          updatedData: JSON.stringify(updatedUser)
        }
      });

      return NextResponse.json({
        code: 200,
        success: true,
        message: "User updated successfully.",
      });
    }

    return NextResponse.json({ code: 400, success: false, message: "Invalid action." });

  } catch (error) {
    console.error("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error." });
  }
}