'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Database, Users, CreditCard, RefreshCw, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { realtimeDatabase } from '@/lib/realtime-database'
import { paymentProcessor } from '@/lib/payment-processor'
import { employeeRegistration } from '@/lib/employee-registration'
import type { RealtimePayload } from '@/lib/realtime-database'

export function RealtimeStatusDashboard() {
  const [recentEvents, setRecentEvents] = useState<RealtimePayload[]>([])
  const [systemStats, setSystemStats] = useState({
    connectionStatus: 'connected',
    eventsProcessed: 0,
    activeSubscriptions: 0,
    lastEventTime: null as string | null
  })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Subscribe to all real-time events
    const unsubscribe = realtimeDatabase.subscribe((payload) => {
      setRecentEvents(prev => [payload, ...prev.slice(0, 19)]) // Keep last 20 events
      setSystemStats(prev => ({
        ...prev,
        eventsProcessed: prev.eventsProcessed + 1,
        lastEventTime: payload.timestamp
      }))
    })

    // Initialize stats
    setSystemStats(prev => ({
      ...prev,
      connectionStatus: realtimeDatabase.getConnectionStatus().connected ? 'connected' : 'disconnected',
      activeSubscriptions: 1
    }))

    return unsubscribe
  }, [])

  const refreshStats = async () => {
    setRefreshing(true)
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update stats
      const connectionStatus = realtimeDatabase.getConnectionStatus()
      const paymentStats = paymentProcessor.getQueueStatus()
      const employeeStats = employeeRegistration.getRegistrationStats()

      setSystemStats(prev => ({
        ...prev,
        connectionStatus: connectionStatus.connected ? 'connected' : 'disconnected',
        activeSubscriptions: connectionStatus.subscriberCount || 1
      }))

    } finally {
      setRefreshing(false)
    }
  }

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'payment_submitted':
      case 'payment_approved':
      case 'payment_rejected':
        return <CreditCard className="h-4 w-4" />
      case 'employee_created':
      case 'employee_updated':
      case 'employee_deleted':
        return <Users className="h-4 w-4" />
      case 'system_notification':
        return <Activity className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getEventColor = (event: string) => {
    switch (event) {
      case 'payment_approved':
      case 'employee_created':
        return 'text-green-600'
      case 'payment_rejected':
      case 'employee_deleted':
        return 'text-red-600'
      case 'payment_submitted':
      case 'employee_updated':
        return 'text-blue-600'
      case 'system_notification':
        return 'text-gray-600'
      default:
        return 'text-purple-600'
    }
  }

  const formatEventDescription = (event: string, data: any) => {
    switch (event) {
      case 'payment_submitted':
        return `New ${data.planType || 'unknown'} payment: ₹${data.amount || 0}`
      case 'payment_approved':
        return `Payment approved: ${data.receiptId}`
      case 'payment_rejected':
        return `Payment rejected: ${data.receiptId}`
      case 'employee_created':
        return `Employee added: ${data.name || 'Unknown'} (${data.employee_code || 'N/A'})`
      case 'employee_updated':
        return `Employee updated: ${data.id || 'Unknown'}`
      case 'employee_deleted':
        return `Employee deleted: ${data.employeeId || 'Unknown'}`
      case 'system_notification':
        return data.message || 'System notification'
      default:
        return `${event} event occurred`
    }
  }

  return (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStats.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-2xl font-bold capitalize">
                {systemStats.connectionStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.eventsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              Since session start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Real-time listeners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Event</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.lastEventTime ? (
                new Date(systemStats.lastEventTime).toLocaleTimeString()
              ) : (
                'None'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Event Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Real-time Event Stream</span>
                <Badge variant="outline" className="ml-2">Live</Badge>
              </CardTitle>
              <CardDescription>
                Live feed of all system events and activities
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent events</p>
                <p className="text-sm">Real-time events will appear here as they occur</p>
              </div>
            ) : (
              recentEvents.map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 mt-1 ${getEventColor(event.event)}`}>
                    {getEventIcon(event.event)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatEventDescription(event.event, event.data)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.event}
                      </Badge>
                      {event.data.userId && (
                        <Badge variant="outline" className="text-xs">
                          User: {event.data.userId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Payment System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Queue Status:</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing:</span>
                <span>{paymentProcessor.getQueueStatus().currentProcessing} items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Queue Length:</span>
                <span>{paymentProcessor.getQueueStatus().queueLength} items</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Employee System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Registration:</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Employees:</span>
                <span>{employeeRegistration.getRegistrationStats().totalEmployees}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending:</span>
                <span>{employeeRegistration.getRegistrationStats().pendingRegistrations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Real-time Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <Badge variant="default">Running</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subscribers:</span>
                <span>{systemStats.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Events/min:</span>
                <span>~{Math.round(systemStats.eventsProcessed / Math.max(1, Date.now() / 60000))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
