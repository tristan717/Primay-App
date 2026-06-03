import { logActivity } from "@/lib/activityLogger";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(req){
    try {
        const { userId } = await req.json();
        
        if(!userId){
            return NextResponse.json({ code: 500, success: false, message: "Unknown user" });
        }


        const { data: userData, error:errorUser } = await db
        .from("users")
        .select("user_id,  f_name, l_name, role, position, department")
        .eq("clerk_user_id", userId)
        .maybeSingle();

        if(!userData.user_id){
            return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
        }

        if(errorUser){
            console.log("error route: ", errorUser)
            return NextResponse.json({code: 500, success: false, message: "User not found." })
        }


        const { data: companyData, error: errFetch } = await db
        .from("organization")
        .select("company_id")
        .eq("user_id", userData.user_id)
        .maybeSingle()

        if(errFetch){
            console.log("error route: ", errFetch)
            return NextResponse.json({code: 500, success: false, message: "Company not found." })
        }

        if(!errFetch && !companyData){
            return NextResponse.json({code: 401, success: false, message: "Enter your company information." })
        }

        if(companyData){
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
                    companyId: companyData.company_id,
                    data: JSON.stringify(companyData)
                },
            });
            return NextResponse.json({code:200, success: true})
        }
    } catch (error) {
        console.log("Error checking company: ", error)
        return NextResponse.json({ code: 500, success: false, message: "Failed to Request"})
    }
}