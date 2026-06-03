"use client";
import { useEffect, useState } from "react";
import react from "react";
import AxiosInstance from "@/utils/axios";
import SysAdminMyOrgPage from "./myOrg/page";


export default function EmployeePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  useEffect(() => {
    async function loadUser(){
      const response = await AxiosInstance.get("/users")
      if(response){
        const res = response.data;
        if(res.code === 200 && res.success === true){
          setLastName(res.data.l_name)
          setFirstName(res.data.f_name)
        }
      }
    }
    loadUser();
  },[setLastName, setFirstName]);

  // document.getElementById('fullName').textContent = `${firstName} ${lastName}`;

  return (
    <div>
      <div className="flex flex-col align-items-center">
        <span className="text-2xl md:text-4xl font-extrabold text-black">Welcome, {firstName} {lastName}!</span>
        <span className="text-mist-500">Here&apos;s what&apos;s happening in your workspace today.</span>
      </div>
      <SysAdminMyOrgPage/>
    </div>
  );
}