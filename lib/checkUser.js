import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/dbServer";

export const checkUser = async () => {
    const user = await currentUser();
    
    if (!user){
        return {code: 300, message: "No logged in user", success: false};
    }

    const email = user.emailAddresses?.[0]?.emailAddress ?? null;
    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const username = user.username ?? "";

   
    try {
        const {data, error} = await db.from("users")
        .select("*")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

        if(error){
            console.log("Request Failed.");
            return { code: 500, message: error.message, success: false };
        }
        if(data){
            return { data, code: 200, success: true, message: "User Found" };
        }

        const { data: createdUser, error: createError } = await db.from("users")
        .insert({
            clerk_user_id: user.id,
            email: email,
            f_name: firstName,
            l_name: lastName,
            role: "SYSADMIN",
            userName: username
        })
        .select()
        .single();

        if(createError){
            return { code: 500, message: createError.message, success: false };
        }

        if(createdUser){
            return { data: createdUser, code: 201, success: true, message: "User Created" };
        }

        return {code: 500, message: "Internal Server Error", success: false};
    } catch (error) {
        console.error("User Auth process failed: ",error.message);
        return {code: 500, message: "Internal Server Error", success: false};
    }
}
