"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiClient } from "@/lib/utils/api-client"

type SeriesPoint = { date?: string; value?: number }
type Period = "7d" | "30d" | "90d" | "1y"

// API Response types for each endpoint
type SalesData = {
  date: string
  sales: number
  orders: number
}

type SalesResponse = {
  success: boolean
  data: {
    period: string
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    salesByDay: SalesData[]
  }
}

type UsersResponse = {
  success: boolean
  data: {
    totalUsers: number
    verifiedUsers: number
    vendors: number
    admins: number
    verificationRate: number
    usersByRole: Array<{ role: string; count: number }>
    usersByMonth: Array<{ month: string; count: number }>
  }
}

type ProductsResponse = {
  success: boolean
  data: {
    totalProducts: number
    productsByCategory: Array<{ category: string; count: number }>
    categoryBreakdown: Record<string, number>
  }
}

type OrdersResponse = {
  success: boolean
  data: {
    totalOrders: number
    paidOrders: number
    pendingOrders: number
    cancelledOrders: number
    paymentSuccessRate: number
    ordersByStatus: Array<{ status: string; count: number }>
    ordersByMonth: Array<{ month: string; count: number }>
  }
}

export function Analytics() {
  const [period, setPeriod] = useState<Period>("30d")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Store data for each endpoint
  const [salesData, setSalesData] = useState<SalesResponse['data'] | null>(null)
  const [usersData, setUsersData] = useState<UsersResponse['data'] | null>(null)
  const [productsData, setProductsData] = useState<ProductsResponse['data'] | null>(null)
  const [ordersData, setOrdersData] = useState<OrdersResponse['data'] | null>(null)
  
  // Individual loading states for each card
  const [loadingStates, setLoadingStates] = useState({
    sales: false,
    users: false,
    products: false,
    orders: false
  })
  
  // Individual error states for each card
  const [errorStates, setErrorStates] = useState({
    sales: null as string | null,
    users: null as string | null,
    products: null as string | null,
    orders: null as string | null
  })

  // Check if any card is still loading
  const isAnyCardLoading = Object.values(loadingStates).some(loading => loading)
  
  // Check if all cards have finished loading (either with data or error)
  const allCardsLoaded = Object.values(loadingStates).every(loading => !loading)

  // Helper function to fetch individual endpoint with retry logic
  const fetchEndpoint = async (endpoint: string, endpointName: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching ${endpointName} (attempt ${attempt}/${maxRetries})`)
        const response = await ApiClient.get(endpoint)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log(`${endpointName} data received:`, data)
        return data
      } catch (error) {
        console.error(`${endpointName} attempt ${attempt} failed:`, error)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    // Reset individual error states
    setErrorStates({ sales: null, users: null, products: null, orders: null })
    
    // Set all loading states to true
    setLoadingStates({ sales: true, users: true, products: true, orders: true })
    
    // Fetch each endpoint individually to prevent one failure from affecting others
    const endpoints = [
      { 
        name: 'sales', 
        endpoint: `/admin/analytics/sales?period=${period}`,
        setter: setSalesData,
        setError: (error: string) => setErrorStates(prev => ({ ...prev, sales: error }))
      },
      { 
        name: 'users', 
        endpoint: `/admin/analytics/users`,
        setter: setUsersData,
        setError: (error: string) => setErrorStates(prev => ({ ...prev, users: error }))
      },
      { 
        name: 'products', 
        endpoint: `/admin/analytics/products`,
        setter: setProductsData,
        setError: (error: string) => setErrorStates(prev => ({ ...prev, products: error }))
      },
      { 
        name: 'orders', 
        endpoint: `/admin/analytics/orders`,
        setter: setOrdersData,
        setError: (error: string) => setErrorStates(prev => ({ ...prev, orders: error }))
      }
    ]
    
    // Process each endpoint
    const promises = endpoints.map(async ({ name, endpoint, setter, setError }) => {
      try {
        const data = await fetchEndpoint(endpoint, name)
        setter(data.data)
        setLoadingStates(prev => ({ ...prev, [name]: false }))
        console.log(`✅ ${name} data loaded successfully`)
      } catch (error) {
        const errorMessage = `Failed to load ${name} data: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMessage}`)
        setError(errorMessage)
        setLoadingStates(prev => ({ ...prev, [name]: false }))
      }
    })
    
    // Wait for all promises to complete (regardless of success/failure)
    await Promise.allSettled(promises)
    
    setLoading(false)
    console.log('All analytics data fetch attempts completed')
  }

  useEffect(() => { fetchData() }, [period])

  // Skeleton Loading Component
  const SkeletonCard = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )

  // Sales Card Component
  const SalesCard = () => {
    // Show skeleton during initial load
    if (isAnyCardLoading && !allCardsLoaded) {
      return <SkeletonCard title="Sales Analytics" subtitle={`${period} period`} />
    }

    // Show error state only if there's an actual error
    if (errorStates.sales) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Analytics</CardTitle>
            <CardDescription>{period} period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-sm text-red-600 mb-2">{errorStates.sales}</div>
              <Button size="sm" variant="outline" onClick={() => {
                setLoadingStates(prev => ({ ...prev, sales: true }))
                fetchEndpoint(`/admin/analytics/sales?period=${period}`, 'sales')
                  .then(data => {
                    setSalesData(data.data)
                    setErrorStates(prev => ({ ...prev, sales: null }))
                  })
                  .catch(error => {
                    setErrorStates(prev => ({ ...prev, sales: `Retry failed: ${error.message}` }))
                  })
                  .finally(() => {
                    setLoadingStates(prev => ({ ...prev, sales: false }))
                  })
              }}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show normal data
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sales Analytics</CardTitle>
          <CardDescription>{period} period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">${salesData?.totalSales?.toLocaleString() || 0}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Orders</div>
                <div className="font-semibold">{salesData?.totalOrders || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Order</div>
                <div className="font-semibold">${salesData?.averageOrderValue?.toFixed(2) || 0}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {salesData?.salesByDay?.length || 0} data points
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Sales Analytics Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-transparent rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">${salesData?.totalSales?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{salesData?.totalOrders || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${salesData?.averageOrderValue?.toFixed(2) || 0}</div>
                    <div className="text-sm text-muted-foreground">Avg Order Value</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Recent Sales Transactions</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {salesData?.salesByDay?.map((sale, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-transparent rounded-lg border border-muted">
                        <div>
                          <div className="font-medium">{new Date(sale.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(sale.date).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${sale.sales}</div>
                          <div className="text-sm text-muted-foreground">{sale.orders} order(s)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  // Users Card Component
  const UsersCard = () => {
    // Show skeleton during initial load
    if (isAnyCardLoading && !allCardsLoaded) {
      return <SkeletonCard title="User Analytics" subtitle="User statistics" />
    }

    // Show error state only if there's an actual error
    if (errorStates.users) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Analytics</CardTitle>
            <CardDescription>User statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-sm text-red-600 mb-2">{errorStates.users}</div>
              <Button size="sm" variant="outline" onClick={() => {
                setLoadingStates(prev => ({ ...prev, users: true }))
                fetchEndpoint(`/admin/analytics/users`, 'users')
                  .then(data => {
                    setUsersData(data.data)
                    setErrorStates(prev => ({ ...prev, users: null }))
                  })
                  .catch(error => {
                    setErrorStates(prev => ({ ...prev, users: `Retry failed: ${error.message}` }))
                  })
                  .finally(() => {
                    setLoadingStates(prev => ({ ...prev, users: false }))
                  })
              }}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show normal data
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Analytics</CardTitle>
          <CardDescription>User statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">{usersData?.totalUsers || 0}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Verified</div>
                <div className="font-semibold">{usersData?.verifiedUsers || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Vendors</div>
                <div className="font-semibold">{usersData?.vendors || 0}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {usersData?.verificationRate?.toFixed(1) || 0}% verification rate
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>User Analytics Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-transparent rounded-lg border border-muted">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{usersData?.totalUsers || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{usersData?.verifiedUsers || 0}</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{usersData?.vendors || 0}</div>
                    <div className="text-sm text-muted-foreground">Vendors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{usersData?.admins || 0}</div>
                    <div className="text-sm text-muted-foreground">Admins</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">User Roles Breakdown</h3>
                  <div className="space-y-2">
                    {usersData?.usersByRole?.map((role, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-transparent rounded-lg border border-muted">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-transparent border border-muted"></div>
                          <span className="font-medium capitalize">{role.role}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{role.count}</div>
                          <div className="text-sm text-muted-foreground">
                            {usersData?.totalUsers ? ((role.count / usersData.totalUsers) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Verification Statistics</h3>
                  <div className="p-4 bg-transparent rounded-lg border border-muted">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {usersData?.verificationRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Verification Rate</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {usersData?.verifiedUsers || 0} out of {usersData?.totalUsers || 0} users verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  // Products Card Component
  const ProductsCard = () => {
    // Show skeleton during initial load
    if (isAnyCardLoading && !allCardsLoaded) {
      return <SkeletonCard title="Product Analytics" subtitle="Product catalog" />
    }

    // Show error state only if there's an actual error
    if (errorStates.products) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Analytics</CardTitle>
            <CardDescription>Product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-sm text-red-600 mb-2">{errorStates.products}</div>
              <Button size="sm" variant="outline" onClick={() => {
                setLoadingStates(prev => ({ ...prev, products: true }))
                fetchEndpoint(`/admin/analytics/products`, 'products')
                  .then(data => {
                    setProductsData(data.data)
                    setErrorStates(prev => ({ ...prev, products: null }))
                  })
                  .catch(error => {
                    setErrorStates(prev => ({ ...prev, products: `Retry failed: ${error.message}` }))
                  })
                  .finally(() => {
                    setLoadingStates(prev => ({ ...prev, products: false }))
                  })
              }}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show normal data
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Analytics</CardTitle>
          <CardDescription>Product catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">{productsData?.totalProducts || 0}</div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Top Categories:</div>
              <div className="space-y-1">
                {productsData?.productsByCategory
                  ?.filter(cat => cat.count > 0)
                  ?.slice(0, 3)
                  ?.map(category => (
                    <div key={category.category} className="flex justify-between text-xs">
                      <span>{category.category}</span>
                      <span className="font-semibold">{category.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                View All Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Product Analytics Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center p-4 bg-transparent rounded-lg border border-muted">
                  <div className="text-4xl font-bold">{productsData?.totalProducts || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Product Categories</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {productsData?.productsByCategory?.map((category, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-transparent rounded-lg border border-muted">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-transparent border border-muted"></div>
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{category.count}</div>
                          <div className="text-sm text-muted-foreground">
                            {productsData?.totalProducts ? ((category.count / productsData.totalProducts) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Category Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-transparent rounded-lg border border-muted text-center">
                      <div className="text-xl font-bold">
                        {productsData?.productsByCategory?.filter(cat => cat.count > 0).length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Categories</div>
                    </div>
                    <div className="p-3 bg-transparent rounded-lg border border-muted text-center">
                      <div className="text-xl font-bold">
                        {productsData?.productsByCategory?.filter(cat => cat.count === 0).length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Empty Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  // Orders Card Component
  const OrdersCard = () => {
    // Show skeleton during initial load
    if (isAnyCardLoading && !allCardsLoaded) {
      return <SkeletonCard title="Order Analytics" subtitle="Order statistics" />
    }

    // Show error state only if there's an actual error
    if (errorStates.orders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Analytics</CardTitle>
            <CardDescription>Order statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-sm text-red-600 mb-2">{errorStates.orders}</div>
              <Button size="sm" variant="outline" onClick={() => {
                setLoadingStates(prev => ({ ...prev, orders: true }))
                fetchEndpoint(`/admin/analytics/orders`, 'orders')
                  .then(data => {
                    setOrdersData(data.data)
                    setErrorStates(prev => ({ ...prev, orders: null }))
                  })
                  .catch(error => {
                    setErrorStates(prev => ({ ...prev, orders: `Retry failed: ${error.message}` }))
                  })
                  .finally(() => {
                    setLoadingStates(prev => ({ ...prev, orders: false }))
                  })
              }}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show normal data
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Analytics</CardTitle>
          <CardDescription>Order statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">{ordersData?.totalOrders || 0}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Paid</div>
                <div className="font-semibold text-green-600">{ordersData?.paidOrders || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Pending</div>
                <div className="font-semibold text-yellow-600">{ordersData?.pendingOrders || 0}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {ordersData?.paymentSuccessRate?.toFixed(1) || 0}% success rate
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-3">
                View Order Status
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Analytics Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-transparent rounded-lg border border-muted">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{ordersData?.totalOrders || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{ordersData?.paidOrders || 0}</div>
                    <div className="text-sm text-muted-foreground">Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{ordersData?.pendingOrders || 0}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{ordersData?.cancelledOrders || 0}</div>
                    <div className="text-sm text-muted-foreground">Cancelled</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Order Status Breakdown</h3>
                  <div className="space-y-2">
                    {ordersData?.ordersByStatus?.map((status, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-transparent rounded-lg border border-muted">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status.status === 'PENDING' ? 'bg-yellow-500' : 
                            status.status === 'PAID' ? 'bg-green-500' : 
                            status.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="font-medium capitalize">{status.status.toLowerCase()}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{status.count}</div>
                          <div className="text-sm text-muted-foreground">
                            {ordersData?.totalOrders ? ((status.count / ordersData.totalOrders) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Payment Success Rate</h3>
                  <div className="p-4 bg-transparent rounded-lg border border-muted">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {ordersData?.paymentSuccessRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Payment Success Rate</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {ordersData?.paidOrders || 0} successful payments out of {ordersData?.totalOrders || 0} total orders
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <div className="flex gap-2">
          {(["7d","30d","90d","1y"] as const).map(p => (
            <Button key={p} size="sm" variant={period===p?"default":"outline"} onClick={() => setPeriod(p)}>{p}</Button>
          ))}
          <Button size="sm" variant="outline" onClick={fetchData} disabled={isAnyCardLoading}>
            {isAnyCardLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchData} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SalesCard />
        <UsersCard />
        <ProductsCard />
        <OrdersCard />
      </div>
    </div>
  )
}