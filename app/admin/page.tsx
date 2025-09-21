'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Users, UserPlus, Megaphone, BarChart3, Settings, Trash2, Edit, Eye, Plus, CheckCircle, XCircle, AlertTriangle, Database, Search, RefreshCw, Download, Upload, Filter, MoreHorizontal, Activity } from 'lucide-react'
import {
  getAllEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getAnalytics,
  getAllPaymentReceipts,
  updatePaymentReceiptStatus,
  searchEmployees,
  bulkDeleteEmployees,
  checkDatabaseConnection,
  getRecentActivity
} from '@/lib/database'
import { paymentProcessor } from '@/lib/payment-processor'
import { employeeRegistration } from '@/lib/employee-registration'
import { RealtimeNotifications } from '@/components/realtime-notifications'
import { RealtimeStatusDashboard } from '@/components/realtime-status-dashboard'
import { useRealtimeUpdates, useEmployeeUpdates, usePaymentReceiptUpdates } from '@/hooks/use-realtime'
import type { Employee, Advertisement, PaymentReceipt } from '@/lib/supabase'
import { RealtimeDebug } from '@/components/realtime-debug'

export default function AdminDashboard() {
  const { toast } = useToast()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalAds: 0,
    totalSubscriptions: 0,
    totalQRCodes: 0,
    totalReceipts: 0
  })
  const [recentActivity, setRecentActivity] = useState({
    recentUsers: [],
    recentEmployees: [],
    recentQRCodes: [],
    recentReceipts: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [databaseConnected, setDatabaseConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  // Use real-time employee updates
  const { employees, loading: employeesLoading } = useEmployeeUpdates()
  const { updates, isConnected } = useRealtimeUpdates([
    'payment_submitted',
    'payment_approved', 
    'payment_rejected',
    'employee_created',
    'employee_updated',
    'employee_deleted'
  ])

  const { paymentReceipts, loading: receiptsLoading, refresh: refreshReceipts } = usePaymentReceiptUpdates()

  // Employee form state
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    phone: '',
    address: '',
    employee_code: '',
    permission: 'read'
  })
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // Advertisement form state
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    category: '',
    image_url: '',
    link_url: '',
    button_text: 'Learn More'
  })

  useEffect(() => {
    loadData()
  }, [])

  // Handle real-time updates
  useEffect(() => {
    if (updates.length === 0) return
  
    const latestUpdate = updates[0]
    
    switch (latestUpdate.event) {
      case 'payment_submitted':
        toast({
          title: "New Payment",
          description: `Payment submitted for ${latestUpdate.data.planType} plan`,
        })
        break
      case 'payment_approved':
        toast({
          title: "Payment Approved", 
          description: `Payment for ${latestUpdate.data.planType} plan has been approved`,
        })
        break
      case 'payment_rejected':
        toast({
          title: "Payment Rejected",
          description: `Payment for ${latestUpdate.data.planType} plan was rejected`,
          variant: "destructive"
        })
        break
      case 'employee_created':
        toast({
          title: "Employee Added",
          description: `${latestUpdate.data.name} has been registered successfully`,
        })
        break
    }
  }, [updates.length, toast]) // Only depend on updates length, not the entire updates array

  const checkConnection = useCallback(async () => {
    const connected = await checkDatabaseConnection()
    setDatabaseConnected(connected)
    return connected
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const connected = await checkConnection()
      
      const [adsRes, analyticsRes, activityRes] = await Promise.all([
        getAllAdvertisements(),
        getAnalytics(),
        getRecentActivity()
      ])

      if (adsRes.data) setAdvertisements(adsRes.data)
      if (analyticsRes.data) setAnalytics(analyticsRes.data)
      if (activityRes.data) setRecentActivity(activityRes.data)

      if (!connected) {
        toast({
          title: "Database Connection",
          description: "Using mock data. Configure Supabase for full functionality.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  } , [checkConnection, toast])

  const refreshData = async () => {
    setRefreshing(true)
    try {
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }

    try {
      const result = await searchEmployees(searchQuery)
      if (result.data) {
        // Note: employees are now handled by useEmployeeUpdates hook
        toast({
          title: "Search Complete",
          description: `Found ${result.data.length} employees`,
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search employees",
        variant: "destructive"
      })
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!employeeForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Employee name is required",
        variant: "destructive"
      })
      return
    }

    if (!employeeForm.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive"
      })
      return
    }

    if (!employeeForm.employee_code.trim()) {
      toast({
        title: "Validation Error",
        description: "Employee code is required",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await employeeRegistration.registerEmployee({
        name: employeeForm.name,
        phone: employeeForm.phone,
        email: `${employeeForm.employee_code}@company.com`, // Generate email from code
        address: employeeForm.address,
        employeeCode: employeeForm.employee_code,
        permission: employeeForm.permission as 'read' | 'write' | 'admin',
        createdBy: 'admin'
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Employee registration initiated. Processing in real-time...",
      })

      setEmployeeForm({
        name: '',
        phone: '',
        address: '',
        employee_code: '',
        permission: 'read'
      })

    } catch (error: any) {
      console.error('Error creating employee:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive"
      })
    }
  }

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    try {
      const result = await employeeRegistration.updateEmployee(editingEmployee.id, employeeForm)

      if (!result) {
        throw new Error('Failed to update employee')
      }

      toast({
        title: "Success",
        description: "Employee updated successfully"
      })

      setEditingEmployee(null)
      setEmployeeForm({
        name: '',
        phone: '',
        address: '',
        employee_code: '',
        permission: 'read'
      })

    } catch (error: any) {
      console.error('Error updating employee:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive"
      })
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      const result = await employeeRegistration.deleteEmployee(id)
      if (!result) {
        throw new Error('Failed to delete employee')
      }

      toast({
        title: "Success",
        description: "Employee deleted successfully"
      })

    } catch (error: any) {
      console.error('Error deleting employee:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive"
      })
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeForm({
      name: employee.name,
      phone: employee.phone,
      address: employee.address,
      employee_code: employee.employee_code,
      permission: employee.permission
    })
  }

  const handleCancelEdit = () => {
    setEditingEmployee(null)
    setEmployeeForm({
      name: '',
      phone: '',
      address: '',
      employee_code: '',
      permission: 'read'
    })
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!adForm.title.trim() || !adForm.description.trim() || !adForm.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Title, description, and category are required",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await createAdvertisement({
        ...adForm,
        views_count: 0,
        clicks_count: 0,
        is_active: true,
        created_by: 'admin'
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Advertisement created successfully"
      })

      setAdForm({
        title: '',
        description: '',
        category: '',
        image_url: '',
        link_url: '',
        button_text: 'Learn More'
      })

      await refreshData()
    } catch (error: any) {
      console.error('Error creating advertisement:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create advertisement",
        variant: "destructive"
      })
    }
  }

  const handleToggleAd = async (id: string, isActive: boolean) => {
    try {
      const result = await updateAdvertisement(id, { is_active: !isActive })
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: `Advertisement ${!isActive ? 'activated' : 'deactivated'}`
      })

      await refreshData()
    } catch (error: any) {
      console.error('Error updating advertisement:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update advertisement",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return

    try {
      const result = await deleteAdvertisement(id)
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Advertisement deleted successfully"
      })

      await refreshData()
    } catch (error: any) {
      console.error('Error deleting advertisement:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete advertisement",
        variant: "destructive"
      })
    }
  }

  const handleReceiptAction = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      let result
      if (status === 'approved') {
        result = await paymentProcessor.approvePayment(id, notes)
      } else {
        result = await paymentProcessor.rejectPayment(id, notes || 'Invalid receipt')
      }
      
      if (!result) {
        throw new Error(`Failed to ${status} payment`)
      }

      toast({
        title: "Success",
        description: `Receipt ${status} successfully. Real-time notification sent to user.`
      })

      // Refresh receipts to ensure latest data
      refreshReceipts()
    } catch (error: any) {
      console.error(`Error ${status} receipt:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${status} receipt`,
        variant: "destructive"
      })
    }
  }

  const exportData = () => {
    const data = {
      employees,
      advertisements,
      paymentReceipts,
      analytics,
      realtimeUpdates: updates.slice(0, 50), // Include recent real-time updates
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `keyra-admin-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Admin data with real-time updates exported successfully"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real-time admin dashboard...</p>
        </div>
      </div>
    )
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchQuery || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phone.includes(searchQuery)
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-time Admin Dashboard</h1>
              <p className="text-gray-600">Manage your QR code application with live updates</p>
            </div>
            <div className="flex items-center space-x-4">
              <RealtimeNotifications />
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live Updates' : 'Mock Data'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{recentActivity.recentUsers.length} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                Real-time updates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advertisements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalAds}</div>
              <p className="text-xs text-muted-foreground">
                {advertisements.filter(ad => ad.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                Active plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalQRCodes}</div>
              <p className="text-xs text-muted-foreground">
                Generated codes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receipts</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReceipts}</div>
              <p className="text-xs text-muted-foreground">
                {paymentReceipts.filter(r => r.status === 'pending').length} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="realtime">Real-time Status</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
            <TabsTrigger value="receipts">Payment Receipts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Real-time Status Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <RealtimeStatusDashboard />
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </CardTitle>
                  <CardDescription>
                    {editingEmployee ? 'Update employee information' : 'Create a new employee profile with real-time processing'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={employeeForm.name}
                        onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={employeeForm.address}
                        onChange={(e) => setEmployeeForm({...employeeForm, address: e.target.value})}
                        placeholder="Enter complete address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_code">Employee Code *</Label>
                      <Input
                        id="employee_code"
                        value={employeeForm.employee_code}
                        onChange={(e) => setEmployeeForm({...employeeForm, employee_code: e.target.value})}
                        placeholder="EMP001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="permission">Permission</Label>
                      <select
                        id="permission"
                        value={employeeForm.permission}
                        onChange={(e) => setEmployeeForm({...employeeForm, permission: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="read">Read Only</option>
                        <option value="write">Read & Write</option>
                        <option value="admin">Admin Access</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1">
                        {editingEmployee ? (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Update Employee
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Employee
                          </>
                        )}
                      </Button>
                      {editingEmployee && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Employee List ({filteredEmployees.length})</span>
                        {employeesLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                      </CardTitle>
                      <CardDescription>Real-time employee management</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSearch}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No employees found</p>
                        <p className="text-sm">
                          {searchQuery ? 'Try adjusting your search' : 'Add your first employee using the form'}
                        </p>
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <h4 className="font-medium">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{employee.phone}</p>
                            <p className="text-xs text-gray-500">Code: {employee.employee_code}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {employee.permission}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Created: {new Date(employee.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleEditEmployee(employee)
                              }}
                              title="Edit Employee"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteEmployee(employee.id)
                              }}
                              title="Delete Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advertisements Tab */}
          <TabsContent value="advertisements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Advertisement</CardTitle>
                  <CardDescription>Add a new advertisement to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAd} className="space-y-4">
                    <div>
                      <Label htmlFor="ad-title">Title *</Label>
                      <Input
                        id="ad-title"
                        value={adForm.title}
                        onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                        placeholder="Advertisement title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-description">Description *</Label>
                      <Textarea
                        id="ad-description"
                        value={adForm.description}
                        onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                        placeholder="Advertisement description"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-category">Category *</Label>
                      <Input
                        id="ad-category"
                        value={adForm.category}
                        onChange={(e) => setAdForm({...adForm, category: e.target.value})}
                        placeholder="e.g., Technology, Business, Support"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-image">Image URL</Label>
                      <Input
                        id="ad-image"
                        value={adForm.image_url}
                        onChange={(e) => setAdForm({...adForm, image_url: e.target.value})}
                        placeholder="/placeholder.svg?height=200&width=300&text=Ad+Image"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-link">Link URL</Label>
                      <Input
                        id="ad-link"
                        value={adForm.link_url}
                        onChange={(e) => setAdForm({...adForm, link_url: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-button">Button Text</Label>
                      <Input
                        id="ad-button"
                        value={adForm.button_text}
                        onChange={(e) => setAdForm({...adForm, button_text: e.target.value})}
                        placeholder="Learn More"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Advertisement
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advertisement List ({advertisements.length})</CardTitle>
                  <CardDescription>Manage existing advertisements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {advertisements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No advertisements found</p>
                        <p className="text-sm">Create your first advertisement</p>
                      </div>
                    ) : (
                      advertisements.map((ad) => (
                        <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <h4 className="font-medium">{ad.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={ad.is_active ? "default" : "secondary"}>
                                {ad.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {ad.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {ad.views_count} views • {ad.clicks_count} clicks
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-1 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleToggleAd(ad.id, ad.is_active)
                              }}
                              title={ad.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {ad.is_active ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteAd(ad.id)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Payment Receipts ({paymentReceipts.length})</span>
                  {receiptsLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                  <Badge variant="outline">Real-time Processing</Badge>
                </CardTitle>
                <CardDescription>Review and approve payment receipts with instant notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentReceipts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payment receipts found</p>
                      <p className="text-sm">Receipts will appear here when users submit them</p>
                    </div>
                  ) : (
                    paymentReceipts.map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-medium">Plan: {receipt.plan_type}</h4>
                              <p className="text-sm text-gray-600">Amount: ₹{receipt.amount}</p>
                              <p className="text-xs text-gray-500">
                                Submitted: {new Date(receipt.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                receipt.status === 'approved' ? 'default' : 
                                receipt.status === 'rejected' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {receipt.status}
                            </Badge>
                          </div>
                          {receipt.admin_notes && (
                            <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded">
                              Admin Notes: {receipt.admin_notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(receipt.receipt_image_url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {receipt.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReceiptAction(receipt.id, 'approved')}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const notes = prompt('Rejection reason (optional):')
                                  if (notes !== null) {
                                    handleReceiptAction(receipt.id, 'rejected', notes || 'Invalid receipt')
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time System Status</CardTitle>
                  <CardDescription>Monitor system health and connectivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Database Connection</h4>
                        <p className="text-sm text-gray-600">
                          {databaseConnected ? 'Connected to Supabase' : 'Using mock data'}
                        </p>
                      </div>
                      <Badge variant={databaseConnected ? "default" : "secondary"}>
                        {databaseConnected ? 'Connected' : 'Mock Data'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Real-time Updates</h4>
                        <p className="text-sm text-gray-600">Live data synchronization</p>
                      </div>
                      <Badge variant={isConnected ? "default" : "destructive"}>
                        {isConnected ? 'Active' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Payment Processing</h4>
                        <p className="text-sm text-gray-600">Concurrent transaction handling</p>
                      </div>
                      <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Employee Registration</h4>
                        <p className="text-sm text-gray-600">Real-time employee onboarding</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Administrative tools and utilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={refreshData}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh All Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={exportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Real-time Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={checkConnection}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Test Database Connection
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "System Status",
                          description: `Queue: ${paymentProcessor.getQueueStatus().queueLength} items, Processing: ${paymentProcessor.getQueueStatus().currentProcessing}`,
                        })
                      }}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Check Queue Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Real-time Debug Component */}
            <RealtimeDebug />

            {!databaseConnected && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Real-time Database Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-yellow-700">
                    <p className="mb-4">
                      Currently using mock data with simulated real-time updates. To enable full real-time functionality, configure your Supabase environment variables:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li>• <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                      <li>• <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                    </ul>
                    <p className="mt-4 text-sm">
                      After setting these variables, restart your application to enable:
                    </p>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• Real-time database subscriptions</li>
                      <li>• Live payment processing</li>
                      <li>• Instant employee registration</li>
                      <li>• Concurrent transaction handling</li>
                      <li>• Push notifications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
