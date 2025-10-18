"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "users", label: "Users", icon: Shield },
    { id: "analytics", label: "Analytics", icon: Settings },
    // { id: "notifications", label: "Notifications", icon: Settings },
  ]

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 h-full",
        isCollapsed ? "w-full md:w-16" : "w-full md:w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && <h2 className="text-lg font-semibold text-sidebar-foreground">SSC Admin Panel</h2>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeSection === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "px-2",
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
