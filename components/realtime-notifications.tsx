'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { realtimeDatabase } from '@/lib/realtime-database'
import type { RealtimePayload } from '@/lib/realtime-database'

interface Notification extends RealtimePayload {
  id: string
  read: boolean
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Subscribe to all real-time events
    const unsubscribe = realtimeDatabase.subscribe((payload) => {
      const notification: Notification = {
        ...payload,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        read: false
      }

      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
      setUnreadCount(prev => prev + 1)
    })

    return unsubscribe
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const getNotificationIcon = (event: string) => {
    switch (event) {
      case 'payment_submitted':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'payment_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'payment_rejected':
        return <X className="h-4 w-4 text-red-500" />
      case 'employee_created':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'employee_updated':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'employee_deleted':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationTitle = (event: string, data: any) => {
    switch (event) {
      case 'payment_submitted':
        return `New Payment: ${data.planType || 'Unknown'} Plan`
      case 'payment_approved':
        return 'Payment Approved'
      case 'payment_rejected':
        return 'Payment Rejected'
      case 'employee_created':
        return `Employee Added: ${data.name || 'Unknown'}`
      case 'employee_updated':
        return `Employee Updated: ${data.name || 'Unknown'}`
      case 'employee_deleted':
        return 'Employee Deleted'
      case 'system_notification':
        return data.message || 'System Notification'
      default:
        return 'New Notification'
    }
  }

  const getNotificationDescription = (event: string, data: any) => {
    switch (event) {
      case 'payment_submitted':
        return `Amount: ₹${data.amount || 0} - Awaiting approval`
      case 'payment_approved':
        return data.adminNotes || 'Payment has been approved'
      case 'payment_rejected':
        return data.adminNotes || 'Payment has been rejected'
      case 'employee_created':
        return `Code: ${data.employee_code || 'N/A'} - ${data.permission || 'read'} access`
      case 'employee_updated':
        return 'Employee information has been updated'
      case 'employee_deleted':
        return `Employee ${data.employee?.name || 'Unknown'} has been removed`
      case 'system_notification':
        return data.type || 'System update'
      default:
        return 'New activity detected'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Real-time Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Live updates from your QR code application
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">Real-time updates will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.event)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {getNotificationTitle(notification.event, notification.data)}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {getNotificationDescription(notification.event, notification.data)}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
