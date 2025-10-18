// "use client"

// import { useEffect, useState } from "react"

// interface VendorDetailsProps {
//   userId: string
// }

// interface Vendor {
//   id: string
//   fullName: string
//   email: string
//   role: string
//   phone: string
//   createdAt: string
//   isVerified?: boolean
// }

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// export function VendorDetails({ userId }: VendorDetailsProps) {
//   const [vendor, setVendor] = useState<Vendor | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [actionLoading, setActionLoading] = useState(false)

//   useEffect(() => {
//     fetchVendor()
//   }, [userId])

//   async function fetchVendor() {
//     try {
//       const res = await fetch(`${BASE_URL}/vendor/${userId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       })
//       const data = await res.json()
//       setVendor(data.data)
//     } catch (err) {
//       console.error("Error fetching vendor:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 🔹 Delete Vendor
//   async function handleDelete() {
//     if (!vendor) return
//     const confirmDelete = window.confirm("Are you sure you want to delete this vendor?")
//     if (!confirmDelete) return

//     setActionLoading(true)
//     try {
//       const res = await fetch(`${BASE_URL}/user/delete-vendor/${userId}`, {
//         method: "DELETE",
//       })
//       if (res.ok) {
//         alert("Vendor deleted successfully")
//         setVendor(null) // clear vendor from UI
//       } else {
//         alert("Failed to delete vendor")
//       }
//     } catch (err) {
//       console.error("Error deleting vendor:", err)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // 🔹 Approve / Reject Vendor
//   // 🔹 Approve / Reject Vendor
//   async function toggleVerify() {
//     if (!vendor) return

//     const newStatus = !vendor.isVerified
//     setActionLoading(true)
//     try {
//       const res = await fetch(`${BASE_URL}/user/verify-vendor/${userId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         if (newStatus) {
//           alert("Vendor approved successfully")
//         } else {
//           alert("Vendor rejected successfully")
//         }
//         setVendor({ ...vendor, isVerified: newStatus })
//       } else {
//         alert(data.message || "Failed to update vendor status")
//       }
//     } catch (err) {
//       console.error("Error verifying vendor:", err)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   if (loading)
//     return (
//       <div className="w-full max-w-2xl rounded-2xl border border-[#684570]/20 bg-white dark:bg-gray-950 shadow-sm p-6 md:p-8">
//         <div className="animate-pulse space-y-4">
//           <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800" />
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
//             <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
//             <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
//             <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
//           </div>
//           <div className="h-10 w-48 rounded bg-gray-200 dark:bg-gray-800" />
//         </div>
//       </div>
//     )
//   if (!vendor)
//     return (
//       <div className="w-full max-w-2xl rounded-2xl border border-[#684570]/20 bg-white dark:bg-gray-950 shadow-sm p-6 text-center">
//         <p className="text-sm text-gray-600 dark:text-gray-300">No vendor found.</p>
//       </div>
//     )

//   return (
//     <div className="w-full max-w-2xl md:max-w-3xl rounded-2xl border border-[#684570]/20 bg-white dark:bg-gray-950 shadow-sm p-6 md:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div className="min-w-0">
//           <h2 className="text-base md:text-lg font-semibold tracking-tight text-[#39243d] dark:text-white">
//             Vendor Details
//           </h2>
//           <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">{vendor.fullName}</p>
//         </div>

//         {/* Verified badge */}
//         <span
//           className={[
//             "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
//             vendor.isVerified
//               ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-200"
//               : "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-200",
//           ].join(" ")}
//           aria-live="polite"
//         >
//           {vendor.isVerified ? "Verified" : "Not Verified"}
//         </span>
//       </div>

//       {/* Details grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//         <div className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">ID</p>
//           <p className="mt-1 font-medium text-gray-900 dark:text-gray-100 break-all">{vendor.id}</p>
//         </div>
//         <div className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</p>
//           <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{vendor.email}</p>
//         </div>
//         <div className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone</p>
//           <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{vendor.phone}</p>
//         </div>
//         <div className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Role</p>
//           <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{vendor.role}</p>
//         </div>
//         <div className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Joined</p>
//           <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
//             {new Date(vendor.createdAt).toLocaleDateString()}
//           </p>
//         </div>
//         <div className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</p>
//           <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{vendor.fullName}</p>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-3 pt-2">
//         <button
//           onClick={toggleVerify}
//           disabled={actionLoading}
//           className="inline-flex items-center justify-center rounded-lg bg-[#684570] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#5d3d66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#684570] disabled:opacity-50 disabled:cursor-not-allowed"
//           aria-busy={actionLoading}
//         >
//           {vendor.isVerified ? "Reject" : "Approve"}
//         </button>

//         <button
//           onClick={handleDelete}
//           disabled={actionLoading}
//           className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
//           aria-busy={actionLoading}
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"

interface VendorDetailsProps {
  userId: string
}

interface Vendor {
  id: string
  fullName: string
  email: string
  role: string
  phone?: string | null
  createdAt: string
  isVerified?: boolean
  businessName?: string | null
  businessType?: string | null
  contactPerson?: string | null
  einNumber?: string | null
  tinNumber?: string | null
  bankName?: string | null
  accountNumber?: string | null
  routingNumber?: string | null
  bankAddress?: string | null
  signatoryName?: string | null
  signatureDate?: string | null
  vendoraccepted?: boolean
  isCompleted?: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
import { ApiClient } from "@/lib/utils/api-client"

export function VendorDetails({ userId }: VendorDetailsProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchVendor()
  }, [userId])
  
  
  // useEffect(() => {
  //   const dummyVendor: Vendor = {
  //     id: "cmfpvxp5w0000tw4gbrwxmumb",
  //     fullName: "Muhammad",
  //     email: "adil@gmail.com",
  //     role: "vendor",
  //     phone: "1223233434",
  //     createdAt: "2025-09-18T20:50:39.908Z",
  //     businessName: "STS Tech",
  //     businessType: "Software & Tech",
  //     contactPerson: "Jhon Doe",
  //     einNumber: "565456",
  //     tinNumber: "764456",
  //     bankName: "UBL",
  //     accountNumber: "0998958324",
  //     routingNumber: "87897",
  //     bankAddress: "43rd Avenue Long Island City NY 11101 USA",
  //     signatoryName: "Muhammad Adil",
  //     signatureDate: "2025-09-18T19:00:00.000Z",
  //     vendoraccepted: true,
  //     isCompleted: true,
  //     isVerified: true, // 👈 You can flip between true/false to test approve/reject button
  //   }

  //   setVendor(dummyVendor)
  //   setLoading(false)
  // }, [userId])

  async function fetchVendor() {
    try {
      const res = await ApiClient.get(`/admin/vendors/${userId}`)
      const data = await res.json()
      setVendor(data.data)
    } catch (err) {
      console.error("Error fetching vendor:", err)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Delete Vendor
  async function handleDelete() {
    if (!vendor) return
    const confirmDelete = window.confirm("Are you sure you want to delete this vendor?")
    if (!confirmDelete) return

    setActionLoading(true)
    try {
      const res = await ApiClient.delete(`/admin/vendors/${vendor.id}`)
      if (res.ok) {
        alert("Vendor deleted successfully")
        setVendor(null) // clear vendor from UI
      } else {
        alert("Failed to delete vendor")
      }
    } catch (err) {
      console.error("Error deleting vendor:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // 🔹 Approve / Reject Vendor
  async function toggleVerify() {
    if (!vendor) return

    const newStatus = !vendor.isVerified
    setActionLoading(true)
    try {
      const res = await ApiClient.put(`/admin/vendors/${vendor.id}/${newStatus ? 'approve' : 'reject'}`, newStatus ? { status: "APPROVED" } : { status: "REJECTED" })
      const data = await res.json()
      if (res.ok) {
        if (newStatus) {
          alert("Vendor approved successfully")
        } else {
          alert("Vendor rejected successfully")
        }
        setVendor({ ...vendor, isVerified: newStatus })
      } else {
        alert(data.message || "Failed to update vendor status")
      }
    } catch (err) {
      console.error("Error verifying vendor:", err)
    } finally {
      setActionLoading(false)
    }
  }

  type Detail = { label: string; value: ReactNode; muted?: boolean }
  const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : undefined)

  if (loading)
    return (
      <div className="w-full max-w-none rounded-2xl border border-[#684570]/20 bg-white dark:bg-gray-950 shadow-sm p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-900" />
          </div>
          <div className="h-10 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    )
  if (!vendor)
    return (
      <div className="w-full max-w-none rounded-2xl border border-[#684570]/20 bg-white dark:bg-gray-950 shadow-sm p-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">No vendor found.</p>
      </div>
    )

  const coreDetails: Detail[] = [
    { label: "ID", value: vendor.id },
    { label: "Email", value: vendor.email },
    { label: "Phone", value: vendor.phone || "Not provided", muted: !vendor.phone },
    { label: "Role", value: vendor.role },
    { label: "Joined", value: formatDate(vendor.createdAt) ?? vendor.createdAt },
  ]

  const businessDetails: Detail[] = []
  if (vendor.businessName) businessDetails.push({ label: "Business Name", value: vendor.businessName })
  if (vendor.businessType) businessDetails.push({ label: "Business Type", value: vendor.businessType })
  if (vendor.contactPerson) businessDetails.push({ label: "Primary Contact", value: vendor.contactPerson })

  const complianceDetails: Detail[] = []
  if (vendor.einNumber) complianceDetails.push({ label: "EIN Number", value: vendor.einNumber })
  if (vendor.tinNumber) complianceDetails.push({ label: "TIN Number", value: vendor.tinNumber })
  if (vendor.signatoryName) complianceDetails.push({ label: "Authorized Signatory", value: vendor.signatoryName })
  const signatureDate = formatDate(vendor.signatureDate)
  if (signatureDate) complianceDetails.push({ label: "Signature Date", value: signatureDate })

  const bankingDetails: Detail[] = []
  if (vendor.bankName) bankingDetails.push({ label: "Bank Name", value: vendor.bankName })
  if (vendor.accountNumber) bankingDetails.push({ label: "Account Number", value: vendor.accountNumber })
  if (vendor.routingNumber) bankingDetails.push({ label: "Routing Number", value: vendor.routingNumber })
  if (vendor.bankAddress) bankingDetails.push({ label: "Bank Address", value: vendor.bankAddress })

  const onboardingDetails: Detail[] = []
  if (typeof vendor.vendoraccepted === "boolean")
    onboardingDetails.push({
      label: "Vendor Agreement",
      value: vendor.vendoraccepted ? "Accepted" : "Pending",
    })
  if (typeof vendor.isCompleted === "boolean")
    onboardingDetails.push({
      label: "Profile Completion",
      value: vendor.isCompleted ? "Completed" : "In Progress",
    })

  const renderDetailCard = (detail: Detail) => (
    <div
      key={detail.label}
      className="rounded-xl border border-[#684570]/10 bg-gray-50 dark:bg-gray-900 p-4 transition hover:border-[#684570]/30"
    >
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{detail.label}</p>
      <p
        className={`mt-1 font-medium break-words ${
          detail.muted ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {detail.value}
      </p>
    </div>
  )

  return (
    <div className="w-full max-w-none rounded-2xl border border-[#684570]/20 bg-white dark:bg-gray-950 shadow-sm p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-semibold tracking-tight text-[#39243d] dark:text-white text-balance">
            Vendor Details
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 break-words">{vendor.fullName}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={actionLoading}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-busy={actionLoading}
        >
          Delete Vendor
        </button>
      </div>

      {/* Verified badge */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={[
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              vendor.isVerified
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-200",
            ].join(" ")}
            aria-live="polite"
          >
            {vendor.isVerified ? "Verified" : "Pending Review"}
          </span>
          <button
            onClick={toggleVerify}
            disabled={actionLoading}
            className="inline-flex items-center justify-center rounded-lg bg-[#684570] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#5d3d66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#684570] disabled:cursor-not-allowed disabled:opacity-50"
            aria-busy={actionLoading}
          >
            {vendor.isVerified ? "Reject" : "Approve"}
          </button>
        </div>
        {/* <p className="text-xs text-gray-500 dark:text-gray-400">
          Status updates take effect immediately for the vendor profile.
        </p> */}
      </div>

      {/* Account Overview */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#39243d] dark:text-white">
          Account Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{coreDetails.map(renderDetailCard)}</div>
      </section>

      {/* Business Profile */}
      {businessDetails.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#39243d] dark:text-white">
            Business Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{businessDetails.map(renderDetailCard)}</div>
        </section>
      )}

      {/* Compliance Details */}
      {complianceDetails.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#39243d] dark:text-white">
            Compliance Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{complianceDetails.map(renderDetailCard)}</div>
        </section>
      )}

      {/* Banking Information */}
      {bankingDetails.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#39243d] dark:text-white">
            Banking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{bankingDetails.map(renderDetailCard)}</div>
        </section>
      )}

      {/* Onboarding Status */}
      {onboardingDetails.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#39243d] dark:text-white">
            Onboarding Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{onboardingDetails.map(renderDetailCard)}</div>
        </section>
      )}
    </div>
  )
}

