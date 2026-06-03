
import { NextResponse } from "next/server";
import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";

export async function GET(){
    try{
        const { userId } = await auth();

        if(!userId){
            return NextResponse.json({code: 500, message: "Unauthenticated User", success: false});
        }

        const {error, data} = await db
        .from("users")
        .select("role, user_id, department")
        .eq("clerk_user_id", userId)
        .single()

        if(error){
            return NextResponse.json({ code: 500, message: error.message, success: false });
        }

        if(!data){
            return NextResponse.json({ code: 404, message: "User profile not found", success: false });
        }
        if(data.role !== "ADMIN"){
            return NextResponse.json({ code: 404, message: "Unauthorized Access.", success: false });
        }

        const {error:fetErr, data:userData} = await db
        .from("users")
        .select("role, user_id, f_name, l_name")
        .neq("user_id", data.user_id)
        .eq("department", data.department)

        if(fetErr){
            return NextResponse.json({ code: 500, message: "Failed to fetch users data", success: false });
        }

        if(!userData){
            return NextResponse.json({ code: 404, message: "Failed to fetch users data", success: false });
        }

        // axios requires the usage of NextResponse.json({})
        return NextResponse.json({userData, code: 200, message: "Successful", success: true });
    } catch(error){
        console.log("Error fetching user");
        return NextResponse.json({code: 500, message: "Internal Server Error", success: false})
    }
}
