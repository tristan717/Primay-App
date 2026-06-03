import React from 'react'
import { checkUser } from '@/lib/checkUser'
import HeaderClient from './headerClient';


const Header = async () => {
  const user = await checkUser();

  const data = user.data ? user.data : user;
  
  return (
    <div>
      <HeaderClient
        userData={data}
      />
    </div>
  )
}

export default Header
