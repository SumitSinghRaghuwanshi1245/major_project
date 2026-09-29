"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  File01Icon,
  UserCircle02Icon,
  Task01Icon,
  CreditCardIcon,
  Settings01Icon,
  BookmarkIcon,
} from "@hugeicons/core-free-icons"

import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: Briefcase01Icon,
  },
  {
    title: "Resume",
    url: "/dashboard/resume",
    icon: File01Icon,
  },
  {
    title: "Saved Jobs",
    url: "/dashboard/saved-jobs",
    icon: BookmarkIcon,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: UserCircle02Icon,
  },
  {
    title: "Application Status",
    url: "/dashboard/status",
    icon: Task01Icon,
  },
]

const navFooter = [
  {
    title: "Billing / Credits",
    url: "/dashboard/billing",
    icon: CreditCardIcon,
  },
  {
    title: "Profile Settings",
    url: "/dashboard/settings",
    icon: Settings01Icon,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 overflow-hidden">
          <div className="flex aspect-square size-8 items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="url(#dg-logo)" />
              <path d="M8 20L14 8L20 20M10.5 16H17.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="dg-logo" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col gap-0.5 truncate pl-1">
            <span className="font-bold text-base truncate">JobBuddy AI</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={
                      <Link href={item.url}>
                        <HugeiconsIcon icon={item.icon} size={24} />
                        <span>{item.title}</span>
                      </Link>
                    }
                    tooltip={item.title} 
                    size="lg" 
                    className="!text-[15px] py-6 font-medium gap-3"
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2 mb-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center overflow-hidden flex-col items-center justify-center hidden group-data-[collapsible=icon]:hidden group-data-[state=expanded]:flex">
               <span className="text-xs font-semibold text-indigo-400">Current Credits</span>
               <span className="text-lg font-bold text-indigo-300">120</span>
            </div>
            {/* Minimal credits view for collapsed state */}
            <div className="mb-2 w-full rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center hidden group-data-[collapsible=icon]:flex flex-col items-center justify-center p-2">
               <span className="text-xs font-bold text-indigo-300">120</span>
            </div>

            <SidebarMenu>
              {navFooter.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={
                      <Link href={item.url}>
                        <HugeiconsIcon icon={item.icon} size={24} />
                        <span>{item.title}</span>
                      </Link>
                    }
                    tooltip={item.title} 
                    size="lg" 
                    className="!text-[15px] py-6 font-medium gap-3"
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
