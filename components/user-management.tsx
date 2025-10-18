"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Shield, ShieldOff, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/utils/api-client";

interface Vendor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function UserManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const fetchVendors = async (
    page = 1,
    search = "",
    verified: "all" | "true" | "false" = "all"
  ) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (search) query.set("search", search);
      if (verified !== "all") query.set("verified", verified);

      const res = await ApiClient.get(`/admin/vendors?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setVendors(data.data?.vendors ?? data.data?.items ?? []);
        setPagination(data.data?.pagination ?? { ...pagination, page });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch vendors",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(1, "", verifiedFilter);
  }, [verifiedFilter]);

  const handleSearch = () => {
    fetchVendors(1, searchTerm, verifiedFilter);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Vendor Management
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage and approve all vendor accounts
        </p>
      </div>

      {/* Stats */}
      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4 md:p-6 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Verified Vendors
              </p>
              <p className="text-2xl font-bold">
                {vendors.filter((v) => v.isVerified).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100">
              <ShieldOff className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Unverified Vendors
              </p>
              <p className="text-2xl font-bold">
                {vendors.filter((v) => !v.isVerified).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Vendors
              </p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Search + Filters + Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendors</CardTitle>
          <CardDescription>List of all registered vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vendors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>

            {/* NEW QUICK FILTERS */}
            <Button
              variant={verifiedFilter === "all" ? "default" : "outline"}
              onClick={() => setVerifiedFilter("all")}
            >
              All
            </Button>
            <Button
              variant={verifiedFilter === "true" ? "default" : "outline"}
              onClick={() => setVerifiedFilter("true")}
            >
              Verified
            </Button>
            <Button
              variant={verifiedFilter === "false" ? "default" : "outline"}
              onClick={() => setVerifiedFilter("false")}
            >
              Not Verified
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>{vendor.fullName}</TableCell>
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>{vendor.phone || "-"}</TableCell>
                        <TableCell>
                          {vendor.isVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Not Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/vendor_details?pageId=${vendor.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View Details
                          </Button></Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        {loading ? "Loading vendors..." : "No vendors found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                fetchVendors(pagination.page - 1, searchTerm, verifiedFilter)
              }
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                fetchVendors(pagination.page + 1, searchTerm, verifiedFilter)
              }
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
