import { NextResponse } from "next/server";
import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";

export async function POST(req){
  try {
    const { userId } = await auth()
    const payload = await req.json();
    const data = payload.payload;

    const { data: userData, error: errFetch } = await db
    .from("users")
    .select("role, user_id, clerk_user_id")
    .eq("clerk_user_id", userId)
    .single()

    if(errFetch){
      console.log("error route: ", errFetch)
      return NextResponse.json({code: 500, success: false, message: "Failed Request." })
    }
    if(!userData.user_id){
        return NextResponse.json({ code: 500, success: false, message: "Unauthenticated User." });
    }

    if(userData.role !== "SYSADMIN"){
      return NextResponse.json({code: 500, success: false, message: "You are not allowed to do this action" })
    }

    const {data: companyVerify, error:errFetchCopmany} = await db
    .from("organization")
    .select("company_id", {count: "exact", head: true})
    .eq("company_name", data.company_name)
    .eq("email_company", data.email_company)

    if(companyVerify){
      return NextResponse.json({code: 500, success:true, message:"Company already exist"})
    }

    if(errFetchCopmany){
      console.log("error route: ", errFetchCopmany)      
      return NextResponse.json({code: 500, success:true, message:"Error verifying"})
    }

    console.log("backend payload: ", data, " ", userData.user_id, " clerk: ", userData.clerk_user_id)
    const {data: createCompany, error: errorCreate } = await db
    .from("organization") 
    .insert({
      "company_name": data.company_name,
      "company_details": data.company_details,
      "company_loc": data.company_loc,
      "email_company": data.email_company,
      "contact_company": data.contact_company,
      "industry": data.industry,
      "user_id": userData.user_id,
    })
    .select()

    console.log("created a company")
    if(createCompany){
      return NextResponse.json({code: 200, success: true, message:"Successfully created!"})
    }
    if(errorCreate){
      console.log("error process: ", errorCreate)
      return NextResponse.json({code: 500, success: false, message:"Failed to create."})
    }

  } catch (error) {
    console.log("error system: ", error)
    return NextResponse.json({code: 500, success: false, message:"Unknown error failed to create."})
  }
}