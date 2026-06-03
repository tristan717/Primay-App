import { SideNav } from '@/components/SideNav';
import React from 'react'
import NotFound from '../not-found';
import { VerifyUser } from '@/actions/VerifyUser';


const MainLayout = async ({children}) => {

  const verified = await VerifyUser();

  if(!verified.success || !verified.data){
    return NotFound()
  }

  const role = verified.data.role
  if(role !== "ADMIN"){
    return NotFound()
  }
  if(verified.data.user_status === true){
    return NotFound()
  }

  return (
      <SideNav role={role}>
        {children}
      </SideNav>
  )
}

export default MainLayout
