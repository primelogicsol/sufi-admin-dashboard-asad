"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { UserManagement } from "./user-management"
import { Overview } from "./overview"
import { UsersAdmin } from "./users-admin"
import { Analytics } from "./analytics"
import { NotificationsAdmin } from "./notifications-admin"


export function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSection = searchParams.get("section") || "overview"
  const [activeSection, setActiveSection] = useState(initialSection)

  useEffect(() => {
    const sectionFromUrl = searchParams.get("section") || "overview"
    setActiveSection(sectionFromUrl)
  }, [searchParams])

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />
      case "vendors":
        return <UserManagement />
      case "users":
        return <UsersAdmin />
      case "analytics":
        return <Analytics />
      case "notifications":
        return <NotificationsAdmin />
      default:
        return <Overview />
    }
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    router.replace(`/?section=${section}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block h-full">
        <AdminSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
