import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, department")
      .eq("clerk_user_id", userId)
      .single();
    
    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if (errUser || userData?.role !== "ADMIN") {
      return NextResponse.json({ code: 500, success: false, message: "Unauthorized access." });
    }

    const { data:employeeData, error:errEmployee } = await db
    .from("users")
    .select("email, f_name, l_name, role, position, user_id, department")
    .eq("department", userData.department)
    .neq("user_id", userData.user_id);
    
    console.log("employees: ", employeeData)
    console.log("errEmployee: ", errEmployee)

    if(errEmployee){
      console.log("error fetch employee: ", errEmployee)
      return NextResponse.json({ code: 500, success: false, message: "Failed to fetch employees." });
    }

    if(!errEmployee && !employeeData){
      return NextResponse.json({ code: 300, success: false, message: "No employees in your department found." });
    }

    return NextResponse.json({
      employeeData,
      code: 200,
      success: true,
      message: "Employees fetched successfully.",
    });
  } catch (error) {
    console.log("Error system:", error);
    return NextResponse.json({ code: 500, success: false, message: "Unknown error, failed to fetch tasks." });
  }
}