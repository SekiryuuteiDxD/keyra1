'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bug, Send, Trash2, Play, Pause, Download, Upload } from 'lucide-react'
import { realtimeDatabase } from '@/lib/realtime-database'
import { paymentProcessor } from '@/lib/payment-processor'
import { employeeRegistration } from '@/lib/employee-registration'
import type { RealtimePayload } from '@/lib/realtime-database'

export function RealtimeDebug() {
  const [debugEvents, setDebugEvents] = useState<RealtimePayload[]>([])
  const [isRecording, setIsRecording] = useState(true)
  const [testEvent, setTestEvent] = useState({
    event: 'payment_submitted',
    data: JSON.stringify({
      userId: 'test_user_123',
      planType: 'premium',
      amount: 999,
      receiptUrl: '/placeholder.svg?height=400&width=300&text=Test+Receipt'
    }, null, 2)
  })

  useEffect(() => {
    if (!isRecording) return

    const unsubscribe = realtimeDatabase.subscribe((payload) => {
      setDebugEvents(prev => [payload, ...prev.slice(0, 99)]) // Keep last 100 events
    })

    return unsubscribe
  }, [isRecording])

  const sendTestEvent = () => {
    try {
      const eventData = JSON.parse(testEvent.data)
      
      switch (testEvent.event) {
        case 'payment_submitted':
          realtimeDatabase.notifyPaymentSubmitted(eventData)
          break
        case 'payment_approved':
          realtimeDatabase.notifyPaymentApproved(eventData.receiptId, eventData.adminNotes)
          break
        case 'payment_rejected':
          realtimeDatabase.notifyPaymentRejected(eventData.receiptId, eventData.adminNotes)
          break
        case 'employee_created':
          realtimeDatabase.notifyEmployeeCreated(eventData)
          break
        case 'employee_updated':
          realtimeDatabase.notifyEmployeeUpdated(eventData.id, eventData.updates)
          break
        case 'employee_deleted':
          realtimeDatabase.notifyEmployeeDeleted(eventData.employeeId, eventData.employee)
          break
        case 'system_notification':
          realtimeDatabase.notifySystemEvent(eventData.message, eventData.type)
          break
        default:
          realtimeDatabase.broadcast({
            event: testEvent.event,
            data: eventData,
            timestamp: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error sending test event:', error)
      alert('Invalid JSON data')
    }
  }

  const clearDebugEvents = () => {
    setDebugEvents([])
  }

  const exportDebugData = () => {
    const debugData = {
      events: debugEvents,
      systemStatus: realtimeDatabase.getConnectionStatus(),
      paymentStats: paymentProcessor.getQueueStatus(),
      employeeStats: employeeRegistration.getRegistrationStats(),
      exportTime: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `realtime-debug-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const simulatePaymentFlow = async () => {
    // Simulate a complete payment flow
    const testPayment = {
      userId: `test_user_${Date.now()}`,
      planType: 'premium',
      amount: 999,
      receiptUrl: '/placeholder.svg?height=400&width=300&text=Simulated+Receipt'
    }

    // Step 1: Submit payment
    realtimeDatabase.notifyPaymentSubmitted(testPayment)

    // Step 2: After 2 seconds, approve payment
    setTimeout(() => {
      realtimeDatabase.notifyPaymentApproved(`receipt_${Date.now()}`, 'Auto-approved for simulation')
    }, 2000)
  }

  const simulateEmployeeFlow = async () => {
    // Simulate employee registration flow
    const testEmployee = {
      id: `emp_${Date.now()}`,
      name: 'Test Employee',
      phone: '+91 9876543210',
      email: 'test@company.com',
      address: '123 Test Street, Test City',
      employee_code: `TEST${Date.now()}`,
      permission: 'read' as const,
      created_by: 'debug',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Step 1: Create employee
    realtimeDatabase.notifyEmployeeCreated(testEmployee)

    // Step 2: After 1 second, update employee
    setTimeout(() => {
      realtimeDatabase.notifyEmployeeUpdated(testEmployee.id, { permission: 'write' })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>Real-time Debug Console</span>
          <Badge variant="outline">Development Tool</Badge>
        </CardTitle>
        <CardDescription>
          Debug and test real-time events, monitor system performance, and simulate user interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Event Monitor</TabsTrigger>
            <TabsTrigger value="test">Test Events</TabsTrigger>
            <TabsTrigger value="simulate">Simulate Flows</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
          </TabsList>

          {/* Event Monitor Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <Badge variant={isRecording ? "default" : "secondary"}>
                  {isRecording ? 'Recording' : 'Paused'}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportDebugData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={clearDebugEvents}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {debugEvents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events recorded</p>
                  <p className="text-sm">
                    {isRecording ? 'Waiting for real-time events...' : 'Start recording to capture events'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {debugEvents.map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{event.event}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(event, null, 2))
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Test Events Tab */}
          <TabsContent value="test" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <select
                  id="event-type"
                  value={testEvent.event}
                  onChange={(e) => setTestEvent({ ...testEvent, event: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="payment_submitted">Payment Submitted</option>
                  <option value="payment_approved">Payment Approved</option>
                  <option value="payment_rejected">Payment Rejected</option>
                  <option value="employee_created">Employee Created</option>
                  <option value="employee_updated">Employee Updated</option>
                  <option value="employee_deleted">Employee Deleted</option>
                  <option value="system_notification">System Notification</option>
                  <option value="custom_event">Custom Event</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={sendTestEvent} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Event
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="event-data">Event Data (JSON)</Label>
              <Textarea
                id="event-data"
                value={testEvent.data}
                onChange={(e) => setTestEvent({ ...testEvent, data: e.target.value })}
                placeholder="Enter JSON data for the event..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-2">Sample Event Data Templates:</p>
              <ul className="space-y-1 text-xs">
                <li><strong>Payment:</strong> {`{ "userId": "user123", "planType": "premium", "amount": 999 }`}</li>
                <li><strong>Employee:</strong> {`{ "name": "John Doe", "employee_code": "EMP001", "permission": "read" }`}</li>
                <li><strong>System:</strong> {`{ "message": "System updated", "type": "info" }`}</li>
              </ul>
            </div>
          </TabsContent>

          {/* Simulate Flows Tab */}
          <TabsContent value="simulate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Flow</CardTitle>
                  <CardDescription>Simulate a complete payment submission and approval process</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={simulatePaymentFlow} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Simulate Payment Flow
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    This will simulate: Payment submission → Auto-approval after 2 seconds
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Flow</CardTitle>
                  <CardDescription>Simulate employee registration and update process</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={simulateEmployeeFlow} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Simulate Employee Flow
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    This will simulate: Employee creation → Permission update after 1 second
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stress Test</CardTitle>
                <CardDescription>Generate multiple events to test system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Generate 10 rapid events
                      for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                          realtimeDatabase.notifySystemEvent(`Stress test event ${i + 1}`, 'info')
                        }, i * 100)
                      }
                    }}
                  >
                    Generate 10 Events
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Generate 50 rapid events
                      for (let i = 0; i < 50; i++) {
                        setTimeout(() => {
                          realtimeDatabase.notifySystemEvent(`Load test event ${i + 1}`, 'info')
                        }, i * 50)
                      }
                    }}
                  >
                    Generate 50 Events
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Use these to test how the system handles rapid event generation
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Info Tab */}
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Subscribers:</span>
                      <span>{realtimeDatabase.getConnectionStatus().subscriberCount || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Events Captured:</span>
                      <span>{debugEvents.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Processor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Queue Length:</span>
                      <span>{paymentProcessor.getQueueStatus().queueLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing:</span>
                      <span>{paymentProcessor.getQueueStatus().currentProcessing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="default">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Employees:</span>
                      <span>{employeeRegistration.getRegistrationStats().totalEmployees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span>{employeeRegistration.getRegistrationStats().pendingRegistrations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin Users:</span>
                      <span>{employeeRegistration.getRegistrationStats().adminCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Events/Session:</span>
                      <span>{debugEvents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recording:</span>
                      <Badge variant={isRecording ? "default" : "secondary"}>
                        {isRecording ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage:</span>
                      <span>~{Math.round(debugEvents.length * 0.5)}KB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    timestamp: new Date().toISOString(),
                    realtimeStatus: realtimeDatabase.getConnectionStatus(),
                    paymentQueue: paymentProcessor.getQueueStatus(),
                    employeeStats: employeeRegistration.getRegistrationStats(),
                    debugSession: {
                      eventsRecorded: debugEvents.length,
                      isRecording,
                      lastEvent: debugEvents[0]?.timestamp || null
                    }
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
