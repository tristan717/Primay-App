
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
        .select("f_name, l_name, role, position, user_id")
        .eq("clerk_user_id", userId)
        .maybeSingle()

        if(error){
            return NextResponse.json({ code: 500, message: error.message, success: false });
        }

        if(!data){
            return NextResponse.json({ code: 404, message: "User profile not found", success: false });
        }

        // axios requires the usage of NextResponse.json({})
        return NextResponse.json({data, code: 200, message: "Successful", success: true });
    } catch(error){
        console.log("Error fetching user");
        return NextResponse.json({code: 500, message: "Internal Server Error", success: false})
    }
}
