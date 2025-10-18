"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApiClient } from "@/lib/utils/api-client"

type HealthResponse = { success: boolean; message?: string }
type OverviewResponse = {
  success: boolean
  data?: {
    users?: { total?: number }
    vendors?: { total?: number }
    sales?: { totalRevenue?: number }
  }
}

export function Overview() {
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null)
  const [overview, setOverview] = useState<OverviewResponse["data"]>()
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [healthRes, overviewRes] = await Promise.all([
        ApiClient.get("/admin/health/database"),
        ApiClient.get("/admin/analytics/overview"),
      ])
      const healthJson: HealthResponse = await healthRes.json()
      const overviewJson: OverviewResponse = await overviewRes.json()
      setDbHealthy(healthRes.ok && healthJson.success !== false)
      setOverview(overviewJson.data)
    } catch (e) {
      setDbHealthy(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground text-sm md:text-base">Health and key metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Database Health</CardTitle>
            <CardDescription>Connectivity and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`h-3 w-3 rounded-full ${dbHealthy ? "bg-green-500" : dbHealthy === null ? "bg-yellow-400" : "bg-red-500"}`} />
              <Button size="sm" variant="outline" onClick={fetchAll} disabled={loading}>
                {loading ? "Checking..." : "Recheck"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>Total count</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {overview?.users?.total ?? "—"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendors</CardTitle>
            <CardDescription>Total count</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {overview?.vendors?.total ?? "—"}
          </CardContent>
        </Card>

        {/* <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sales</CardTitle>
            <CardDescription>Total revenue</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {overview?.sales?.totalRevenue != null ? `$${overview.sales.totalRevenue.toLocaleString()}` : "—"}
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}


