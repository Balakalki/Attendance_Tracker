import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarCheck, CalendarDays, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../ui/loader";

function initialsOf(name) {
  if (!name) return "GU";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0][0] + (parts[0][1] || "")).toUpperCase();
}

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();

  useEffect(() => {
    async function getUser() {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth`, {
          withCredentials: true,
        });
        setUser(response?.data?.message);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    getUser();
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Attendance", href: "/attendance", icon: CalendarCheck },
    { name: "Timetable", href: "/timetable", icon: CalendarDays },
  ];

  const handleLogOut = async () => {
    await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  const initials = initialsOf(user);

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white">
              <CalendarCheck className="size-5" />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              Attendance Tracker
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3">
          <nav className="flex flex-col gap-1 py-2">
            {navigation.map((item) => {
              const current = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    current
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="size-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{user ?? "Guest"}</p>
              <p className="truncate text-xs text-slate-500">Student</p>
            </div>
          </div>
          <Link to="/login">
            <button
              onClick={handleLogOut}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="size-4" /> Logout
            </button>
          </Link>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
          <SidebarTrigger className="text-slate-600" />
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-sm font-medium text-slate-700 sm:block">
              {user ?? "Guest"}
            </span>
            <div className="grid size-8 place-items-center rounded-full bg-violet-600 text-xs font-semibold text-white">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
