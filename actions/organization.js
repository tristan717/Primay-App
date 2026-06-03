"use server";
import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";


export async function getOrganization() {
  try {
    const { userId } = await auth();

    const {data: userData, error:errFetch} = await db
    .from("users")
    .select("user_id, role")
    .eq("clerk_user_id", userId)
    .single()

    if(errFetch){
      return {code: 500, success:false, message: "Failed to Request"}
    }

    if(userData.role !== "SYSADMIN"){
      return {code: 500, success:false, message: "Unauthorized user."}
    }

    const { data, error } = await db
      .from("organization")
      .select("*")
      .eq("user_id", userData.user_id)
      .limit(1)
      .maybeSingle();
    
    if(error){
      console.log('error: ', error)
      return {code: 500, success:false, message: "Failed to request companies."}
    }

    if (data) {
      return { data, code: 200, success: true, message: "This is your company." };
    }
    if (!data && !error) {
      return {code: 201, success: true, message: "Enter your company information." };
    }
  } catch (error) {
    console.log('error: ', error)
    return {code: 500, success:false, message: "Failed to request companies."}
  }
}
