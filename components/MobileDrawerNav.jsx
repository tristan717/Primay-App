"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerHeader } from "./ui/drawer";
import { House, LayoutDashboard, AtomIcon, ArrowLeft, Layout, Loader2, UserRoundCog, AlignJustify, LogIn } from "lucide-react";


const MobileNavDrawer = ({ 
  isAdminPage = false,
  isAdmin = false,
  isSignedIn = false,
  isStaff = false,
  SysAdminPage = false,
  isSysAdmin = false,
  loading=false,
  onNavClick = () => {},
}) => {
  const pathname = usePathname();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <AlignJustify />
        </Button>
      </DrawerTrigger>

      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader className="pb-0">
          <DrawerTitle>
            Menu
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 flex flex-col gap-2">
          {/* Home */}
            <Link href="/" passHref>
              <Button disabled={loading} onClick={onNavClick} variant="outline" className="w-full justify-start border border-black font-semibold">
                <House size={18} /> <span className="ml-2">Home</span>
              </Button>
            </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNavDrawer;
