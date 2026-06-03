import { Button } from '@/components/ui/button'
import { OctagonX } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NotFound = async() => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen 
    px-4 text-center'> 
        <OctagonX className='text-red-500 h-28 w-28'/><h1 className="text-2xl font-semibold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
            Oops! You may not have access to this page.
        </p>
        <Link href='/'>
            <Button className="rounded-md text-black text-base border-black hover:bg-lime-500 hover:border-none" variant="outline">Return Home</Button>
        </Link>
    </div>
  )
}

export default NotFound
