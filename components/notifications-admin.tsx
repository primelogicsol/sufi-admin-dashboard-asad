"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ApiClient } from "@/lib/utils/api-client"
import { toast } from "@/hooks/use-toast"

type Template = { id?: string; name: string; type: string; subject?: string; body?: string; variables?: string[] }

export function NotificationsAdmin() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [form, setForm] = useState<Template>({ name: "", type: "SYSTEM", subject: "", body: "", variables: [] })
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null)

  const loadTemplates = async () => {
    try {
      const res = await ApiClient.get(`/admin/notifications/templates`)
      const data = await res.json()
      if (res.ok) setTemplates(data.data ?? [])
    } catch {}
  }

  const checkConnection = async () => {
    try {
      const res = await ApiClient.get(`/admin/notifications/connection-status`)
      setConnectionOk(res.ok)
    } catch { setConnectionOk(false) }
  }

  useEffect(() => {
    loadTemplates()
    checkConnection()
  }, [])

  const createTemplate = async () => {
    try {
      const res = await ApiClient.post(`/admin/notifications/templates`, form)
      if (!res.ok) throw new Error("Failed to create template")
      toast({ title: "Created", description: "Template created" })
      setForm({ name: "", type: "SYSTEM", subject: "", body: "", variables: [] })
      loadTemplates()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" })
    }
  }

  const broadcast = async () => {
    try {
      const res = await ApiClient.post(`/admin/notifications/broadcast`, {
        type: "SYSTEM",
        title: form.subject || "System Message",
        message: form.body || "",
        priority: "HIGH",
        data: {},
      })
      if (!res.ok) throw new Error("Failed to broadcast")
      toast({ title: "Broadcast sent" })
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" })
    }
  }

  const cleanup = async () => { try { await ApiClient.post(`/admin/notifications/cleanup`, {}); toast({ title: "Cleanup triggered" }) } catch {} }
  const retry = async () => { try { await ApiClient.post(`/admin/notifications/retry`, {}); toast({ title: "Retry triggered" }) } catch {} }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground text-sm md:text-base">Templates and broadcasts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection</CardTitle>
          <CardDescription>Status with provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-sm ${connectionOk ? 'text-green-600' : connectionOk===false ? 'text-red-600' : 'text-muted-foreground'}`}>{connectionOk===null? 'Unknown' : connectionOk ? 'Connected' : 'Not connected'}</div>
          <Button className="mt-2" variant="outline" onClick={checkConnection}>Recheck</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates</CardTitle>
          <CardDescription>Create and list templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <Input placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} />
            <Input placeholder="Type" value={form.type} onChange={e=>setForm(f=>({...f, type: e.target.value}))} />
            <Input placeholder="Subject" value={form.subject} onChange={e=>setForm(f=>({...f, subject: e.target.value}))} />
            <Textarea placeholder="Body" value={form.body} onChange={e=>setForm(f=>({...f, body: e.target.value}))} />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button onClick={createTemplate}>Create Template</Button>
            <Button variant="outline" onClick={broadcast}>Broadcast</Button>
            <Button variant="outline" onClick={cleanup}>Cleanup Expired</Button>
            <Button variant="outline" onClick={retry}>Retry Failed</Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">{templates.length} templates</div>
        </CardContent>
      </Card>
    </div>
  )
}


