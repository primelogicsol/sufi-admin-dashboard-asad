"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApiClient } from "@/lib/utils/api-client"
import { toast } from "@/hooks/use-toast"

type AdminUser = { id: string; email: string; fullName?: string; role?: string; isVerified?: boolean; createdAt?: string }

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchUsers = async (p = 1) => {
    try {
      setLoading(true)
      const query = new URLSearchParams({ page: String(p), limit: String(limit) })
      if (search) query.set("search", search)
      const res = await ApiClient.get(`/admin/users?${query.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setUsers(data.data?.users ?? data.data?.items ?? [])
        setTotalPages(data.data?.pagination?.totalPages ?? 1)
        setPage(p)
      } else {
        toast({ title: "Error", description: data.message || "Failed to fetch users", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Unable to fetch users", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateRole = async (userId: string, role: string) => {
    try {
      const res = await ApiClient.put(`/admin/users/${userId}/role`, { role })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update role")
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)))
      toast({ title: "Success", description: "Role updated" })
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to update role", variant: "destructive" })
    }
  }

  const updateVerification = async (userId: string, isVerified: boolean) => {
    try {
      const res = await ApiClient.put(`/admin/users/${userId}/verification`, { isVerified })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update verification")
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isVerified } : u)))
      toast({ title: "Success", description: "Verification updated" })
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to update verification", variant: "destructive" })
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const res = await ApiClient.delete(`/admin/users/${userId}`)
      if (!res.ok) throw new Error("Failed to delete user")
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast({ title: "Success", description: "User deleted" })
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to delete user", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground text-sm md:text-base">Manage all users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>List of platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <Button onClick={() => fetchUsers(1)}>Search</Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.fullName || "—"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant={u.role === "user" ? "default" : "outline"} onClick={() => updateRole(u.id, "user")}>User</Button>
                            <Button size="sm" variant={u.role === "vendor" ? "default" : "outline"} onClick={() => updateRole(u.id, "vendor")}>Vendor</Button>
                            <Button size="sm" variant={u.role === "admin" ? "default" : "outline"} onClick={() => updateRole(u.id, "admin")}>Admin</Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.isVerified ? <Badge className="bg-green-100 text-green-800">Verified</Badge> : <Badge className="bg-yellow-100 text-yellow-800">Not Verified</Badge>}
                          <div className="mt-2">
                            <Button size="sm" variant={u.isVerified ? "outline" : "default"} onClick={() => updateVerification(u.id, !u.isVerified)}>Toggle</Button>
                          </div>
                        </TableCell>
                        <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">{loading ? "Loading users..." : "No users found"}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchUsers(page + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


