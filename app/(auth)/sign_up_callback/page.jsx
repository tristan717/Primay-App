"use client";

import AxiosInstance from "@/utils/axios";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function SignUpCallback(){
    const router = useRouter();
    const {isLoaded, isSignedIn, userId } = useAuth();

    useEffect(() => {
        if(!isLoaded) return;

        if(!isSignedIn){
            router.push("/sign-in")
            return;
        }
        async function checkUserCompany(userId){
            try {

                const response = await AxiosInstance.post("/company_check", { userId });
                console.log("response: ", response)
                if(response) {
                    if(response.data){
                        const res = response.data;
                        if(res.code === 401 && res.success === false){
                            console.log("res: ", res)
                            console.log("going to company setup")
                            router.push("/company-setup");
                        }
                        if(res.success === true && res.code === 200){
                            router.push("/sysadmin/myOrg");
                        }
                    }
                }
            } catch (error) {
                console.error("Error company validate: ", error);
                router.push('/')
            }
        }
        checkUserCompany(userId);
    }, [isLoaded, isSignedIn, userId, router]);



    return <div>Please Wait.</div>;
}