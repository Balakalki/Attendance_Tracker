import { Calendar, CalendarCheck, User} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: User,
  },
  {
    title: "Attendance",
    url: "#",
    icon: CalendarCheck,
  },
  {
    title: "Timetable",
    url: "#",
    icon: Calendar,
  },
]

export default function Sidenav() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
            <p className="text-primary font-bold ">
              Attendance Tracker
            </p>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
