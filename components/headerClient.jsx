"use client";
import React from 'react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { Show, SignUpButton } from '@clerk/react';
import Link from 'next/link';
import { Button } from './ui/button';
import MobileNavDrawer from './MobileDrawerNav';


const HeaderClient = ({ userData, setupRequired = false }) => {
  const payload = userData
  const isSysAdmin = payload.role === "SYSADMIN"
  const isAdmin = payload.role === "ADMIN"
  const isEmployee = payload.role === "EMPLOYEE"
  return (
    <div className='fixed top-0 w-full bg-white z-50 border-b'>
      <nav className='container max-auto px-4 py-4 flex items-center justify-between'>
        <Link href='/' className='flex items-center'>
            <span className="text-3xl font-bold text-lime-400">Primary</span>
        </Link> 
        <div className="flex flex-row gap-3 justify-end align-items-center">
          <div className='hidden md:flex gap-2'>
            {isSysAdmin && (
              <Link href={setupRequired ? "/company-setup" : "/sysadmin/myOrg"}>
                <Button className="bg-white hover:bg-lime-500 text-black 
                font-normal transition-colors duration-300 ease-in-out">
                  {setupRequired ? "Setup" : "Workspace"}
                </Button>  
              </Link>
            )}

            {isEmployee && (
                <Link href="/employee/tasks">
                  <Button className="bg-white hover:bg-lime-500 text-black 
                  font-normal transition-colors duration-300 ease-in-out">
                    Workspace
                  </Button>  
              </Link>
            )}

            {isAdmin && (
              <Link href="/admin/projects">
                <Button className="bg-white hover:bg-lime-500 text-black 
                font-normal transition-colors duration-300 ease-in-out">
                  Workspace
                </Button>
              </Link>
            )}

          </div>
            
          <div className="md:hidden">
            <MobileNavDrawer
              // isAdminPage={isAdminPage}
              // isAdmin={isAdmin}
              // isSignedIn={isSignedIn}
              // isStaff={isStaff}
              // SysAdminPage={SysAdminPage} 
              // isSysAdmin={isSysAdmin} 
              // loading={loading}
              // onNavClick={() => setLoading(true)}
            />
          </div>
          
          <Show when="signed-out">
            <div className="flex items-center gap-2">
            <SignInButton>
              <button className="bg-black text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </div>
    
    
        
  )
}

export default HeaderClient
