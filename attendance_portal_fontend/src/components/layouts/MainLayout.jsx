import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CalendarCheck, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import axios from "axios";


const MainLayout = ({ children, isAdmin = false }) => {
  const location = useLocation();
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: <User className="h-5 w-5" />,
      current: location.pathname === "/"
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: <CalendarCheck className="h-5 w-5" />,
      current: location.pathname === "/attendance"
    },
    {
      name: "Timetable",
      href: "/timetable",
      icon: <Calendar className="h-5 w-5" />,
      current: location.pathname === "/timetable"
    }
  ];

  const handleLogOut = async () =>{
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`, {}, { withCredentials: true });
    console.log("cookei cleard");
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-100">
        <Sidebar className="border-none">
          <SidebarHeader className="py-4">
            <div className="px-3 flex items-center">
              <span className="font-bold text-xl text-primary">Attendance Tracker</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    item.current
                      ? "bg-primary text-[rgb(245,247,250)]"
                      : "hover:bg-[rgb(240,245,250)]"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </SidebarContent>
          
          <SidebarFooter className="py-4">
            <div className="px-3">
              <Link to="/login">
                <Button variant="outline" onClick={handleLogOut} className="w-full">
                  Logout
                </Button>
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <header className="h-14 bg-background flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-medium">John Doe</span>
              <div className="h-8 w-8 rounded-full bg-[rgb(153,102,255)] flex items-center justify-center text-white">
                JD
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;