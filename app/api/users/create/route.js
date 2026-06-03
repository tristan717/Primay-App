import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/utils/dbServer";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activityLogger";
import { getClientIp } from "@/utils/getClientIp";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { code: 401, success: false, message: "Unauthenticated User." },
        { status: 401 }
      );
    }

    // Verify user is SYSADMIN
    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, department, org_id, f_name, l_name, position")
      .eq("clerk_user_id", userId)
      .single();

    if (errUser || !userData?.user_id || userData?.role !== "SYSADMIN") {
      return NextResponse.json(
        { code: 403, success: false, message: "Only SysAdmins can create users." },
        { status: 403 }
      );
    }

    // Get request body
    const { f_name, l_name, email, position, role, department, username } = await req.json();

    // Validate required fields
    if (!f_name || !l_name || !email || !role) {
      return NextResponse.json(
        { code: 400, success: false, message: "Please provide all required fields: f_name, l_name, email, role." },
        { status: 400 }
      );
    }

    const client = await clerkClient()

    const clerkUser = await client.users.createUser({
        emailAddress: [email],
        firstName: f_name,
        lastName: l_name,
        username: username,
    });

    console.log("Clerk user created:", clerkUser.id);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { code: 400, success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await db
      .from("users")
      .select("user_id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { code: 409, success: false, message: "Email already exists in the system." },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = ["ADMIN", "EMPLOYEE", "SYSADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { code: 400, success: false, message: "Invalid role. Must be ADMIN, EMPLOYEE, or SYSADMIN." },
        { status: 400 }
      );
    }

    // Create new user in database
    const { data: newUser, error: errCreate } = await db
      .from("users")
      .insert({
        f_name,
        l_name,
        email,
        clerk_user_id: clerkUser.id,
        position: position || null,
        userName: username,
        role,
        department: department || userData.department,
        org_id: userData.org_id,
        user_status: false, // New users are active by default
      })
      .select()
      .single();

    if (errCreate) {
      console.error("Error creating user:", errCreate);
      return NextResponse.json(
        { code: 500, success: false, message: "Failed to create user in database." },
        { status: 500 }
      );
    }

    const clientIp = getClientIp(req);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: "Created Employee",
      method: "POST",
      ipAdd: clientIp,
      activityJson: {
        userId: userData.user_id,
        data: JSON.stringify(newUser)
      },
    });

    return NextResponse.json({
      code: 200,
      success: true,
      message: "User created successfully.",
      data: newUser,
    });
  } catch (error) {
    console.error("Error in create user route:", error);
    return NextResponse.json(
      { code: 500, success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}