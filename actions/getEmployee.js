"use server";
import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";


export async function getEmployeeDetails(employee_id) {
  try {
    const { userId } = await auth();

    if(!userId){
        return {code: 500, success:false, message: "Unauthenticated user."}
    }

    const {data: userData, error:errFetch} = await db
    .from("users")
    .select("user_id, role")
    .eq("clerk_user_id", userId)
    .single()

    if(errFetch){
      return {code: 500, success:false, message: "Failed to Request"}
    }

    if(userData.role !== "ADMIN"){
      return {code: 500, success:false, message: "Unauthorized user."}
    }

    const { data, error } = await db
      .from("users")
      .select("f_name, l_name")
      .eq("user_id", employee_id)
      .single();
    
    if(error){
      console.log('error: ', error)
      return {code: 500, success:false, message: "Failed to request."}
    }

    if (data) {
      return { data, code: 200, success: true, message: "Employee Found." };
    }
    if (!data && !error) {
      return {code: 201, success: true, message: "Employee not found." };
    }
  } catch (error) {
    console.log('error: ', error)
    return {code: 500, success:false, message: "Failed to request companies."}
  }
}
