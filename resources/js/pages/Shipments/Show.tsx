import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Download, Phone, Mail } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  returned: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function ShipmentsShow() {
  const { shipment } = usePage().props as any

  return (
    <AppLayout>
      <Head title={`Shipment ${shipment.tracking_number}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link href="/shipments" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Shipments
            </Link>
            <h1 className="text-3xl font-bold">{shipment.tracking_number}</h1>
            {shipment.reference_number && (
              <p className="text-gray-600">Ref: {shipment.reference_number}</p>
            )}
          </div>
          <Badge className={`${statusColors[shipment.status]}`}>
            {shipment.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Route Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Origin */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">FROM</h3>
                    <div>
                      <p className="font-bold text-lg">{shipment.origin_city}</p>
                      <p className="text-gray-600">{shipment.origin_country}</p>
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">TO</h3>
                    <div>
                      <p className="font-bold text-lg">{shipment.destination_city}</p>
                      <p className="text-gray-600">{shipment.destination_country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-600">Item Description</label>
                    <p className="font-semibold">{shipment.item_description}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Quantity</label>
                    <p className="font-semibold">{shipment.item_quantity} pieces</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Weight</label>
                    <p className="font-semibold">{shipment.weight} kg</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Dimensions</label>
                    <p className="font-semibold">
                      {shipment.length && shipment.width && shipment.height
                        ? `${shipment.length} x ${shipment.width} x ${shipment.height} cm`
                        : 'N/A'}
                    </p>
                  </div>
                  {shipment.declared_value && (
                    <div>
                      <label className="text-sm text-gray-600">Declared Value</label>
                      <p className="font-semibold">₹{parseFloat(String(shipment.declared_value)).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service & Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-600">Service Type</label>
                    <p className="font-semibold capitalize">{shipment.service_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Carrier</label>
                    <p className="font-semibold">{shipment.carrier || 'N/A'}</p>
                  </div>
                  {shipment.pickup_date && (
                    <div>
                      <label className="text-sm text-gray-600">Pickup Date</label>
                      <p className="font-semibold">{new Date(shipment.pickup_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {shipment.expected_delivery_date && (
                    <div>
                      <label className="text-sm text-gray-600">Expected Delivery</label>
                      <p className="font-semibold">{new Date(shipment.expected_delivery_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {shipment.actual_delivery_date && (
                    <div>
                      <label className="text-sm text-gray-600">Actual Delivery</label>
                      <p className="font-semibold">{new Date(shipment.actual_delivery_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {shipment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{shipment.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Freight</span>
                    <span className="font-semibold">₹{shipment.base_freight ? parseFloat(String(shipment.base_freight)).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Handling Charge</span>
                    <span className="font-semibold">₹{shipment.handling_charge ? parseFloat(String(shipment.handling_charge)).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold">₹{shipment.tax ? parseFloat(String(shipment.tax)).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Total Cost</span>
                    <span className="font-bold text-lg">₹{shipment.total_cost ? parseFloat(String(shipment.total_cost)).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Print Shipment
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  <strong>Status:</strong> {shipment.status.replace('_', ' ')}
                </p>
                <p className="text-xs text-blue-800 mt-2">
                  Last updated: {new Date(shipment.updated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
