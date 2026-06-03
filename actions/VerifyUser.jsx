import { db } from "@/utils/dbServer";
import { auth } from "@clerk/nextjs/server";

export async function VerifyUser(){
    try {
        const { userId } = await auth();

        if(!userId){
            return { code: 401, message: "Unauthenticated User", success: false };
        }

        const {error, data} = await db
        .from("users")
        .select("f_name, l_name, role, position, user_id, user_status")
        .eq("clerk_user_id", userId)
        .maybeSingle();

        if(error){
            return { code: 500, message: error.message, success: false };
        }

        if(!data){
            return { code: 404, message: "User profile not found", success: false };
        }

        return { data, code: 200, success: true };
    } catch (error) {
        return { code: 500, message: "Internal Server Error", success: false };
    }
}
