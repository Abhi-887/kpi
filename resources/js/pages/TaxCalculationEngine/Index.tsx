import React, { useState, useEffect } from 'react'
import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { type BreadcrumbItem } from '@/types'
import { AlertCircle, Calculator, BookOpen, Zap, Plus, Trash2, DollarSign } from 'lucide-react'

interface Charge {
  id: number
  charge_code: string
  charge_name: string
  is_active: boolean
  defaultTax?: {
    id: number
    tax_code: string
    tax_name: string
    rate: number
    is_active: boolean
  }
}

interface TaxCode {
  id: number
  tax_code: string
  tax_name: string
  rate: number
  applicability: string
  tax_type: string
  jurisdiction: string | null
  effective_from: string
  is_active: boolean
}

interface TaxCalculationResult {
  sale_price: number
  tax_code: string
  tax_rate: number
  tax_amount: number
  total_amount: number
}

interface BatchItem {
  sale_price: number
  charge_id: number
}

interface BatchResult {
  items: TaxCalculationResult[]
  totals: {
    total_sale_price: number
    total_tax_amount: number
    total_amount: number
  }
}

export default function TaxCalculationEngineIndex() {
  const { charges = [], taxCodes = [] } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Tax Calculation Engine',
      href: '/tax-engine',
    },
  ]

  // Single calculation state
  const [singleSalePrice, setSingleSalePrice] = useState('')
  const [singleChargeId, setSingleChargeId] = useState('')
  const [singleResult, setSingleResult] = useState<TaxCalculationResult | null>(null)
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleError, setSingleError] = useState('')

  // Batch calculation state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchError, setBatchError] = useState('')

  const handleCalculateSingle = async () => {
    if (!singleSalePrice || !singleChargeId) {
      setSingleError('Please fill in all fields')
      return
    }

    setSingleLoading(true)
    setSingleError('')
    setSingleResult(null)

    try {
      const response = await fetch('/tax-engine/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          sale_price: parseFloat(singleSalePrice),
          charge_id: parseInt(singleChargeId),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSingleResult(data.data)
      } else {
        setSingleError(data.error || 'Failed to calculate tax')
      }
    } catch (error) {
      setSingleError('An error occurred while calculating tax')
      console.error(error)
    } finally {
      setSingleLoading(false)
    }
  }

  const handleAddBatchItem = () => {
    setBatchItems([...batchItems, { sale_price: 0, charge_id: 0 }])
  }

  const handleRemoveBatchItem = (index: number) => {
    setBatchItems(batchItems.filter((_, i) => i !== index))
  }

  const handleBatchItemChange = (index: number, field: 'sale_price' | 'charge_id', value: string) => {
    const newItems = [...batchItems]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'sale_price' ? parseFloat(value) : parseInt(value),
    }
    setBatchItems(newItems)
  }

  const handleCalculateBatch = async () => {
    if (batchItems.length === 0) {
      setBatchError('Please add at least one item')
      return
    }

    if (batchItems.some(item => !item.sale_price || !item.charge_id)) {
      setBatchError('Please fill in all item details')
      return
    }

    setBatchLoading(true)
    setBatchError('')
    setBatchResult(null)

    try {
      const response = await fetch('/tax-engine/calculate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          items: batchItems,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setBatchResult(data.data)
      } else {
        setBatchError(data.error || 'Failed to calculate batch tax')
      }
    } catch (error) {
      setBatchError('An error occurred while calculating batch tax')
      console.error(error)
    } finally {
      setBatchLoading(false)
    }
  }

  const getChargeInfo = (chargeId: number) => {
    return charges.find((c: Charge) => c.id === parseInt(String(chargeId)))
  }

  const getTaxCodeInfo = (chargeId: number) => {
    const charge = getChargeInfo(chargeId)
    return charge?.defaultTax
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tax Calculation Engine" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-4xl">💰</span>
              Tax Calculation Engine
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Apply GST (Goods and Services Tax) to sale prices based on charge master configuration
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">🧮</span>
                  Single Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Calculate GST for a single line item with real-time tax rate lookup
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Batch Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Calculate tax for multiple items with aggregated totals and breakdown
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  Dynamic Lookup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time retrieval of tax rates from Tax Master for accurate calculations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Calculators Section */}
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Item</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            <TabsTrigger value="reference">Tax Master Reference</TabsTrigger>
          </TabsList>

          {/* Single Item Calculator */}
          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Single Line Item Tax Calculator
                </CardTitle>
                <CardDescription>
                  Calculate GST for a single charge item with automatic tax rate lookup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Charge Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Charge *</Label>
                    <Select value={singleChargeId} onValueChange={setSingleChargeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a charge" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {charges.map((charge: Charge) => (
                          <SelectItem key={charge.id} value={String(charge.id)}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary">{charge.charge_code}</span>
                              <span className="text-sm text-gray-600">{charge.charge_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {singleChargeId && getTaxCodeInfo(parseInt(singleChargeId)) && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">Tax Code</p>
                        <p className="text-sm font-mono font-bold">
                          {getTaxCodeInfo(parseInt(singleChargeId))?.tax_code}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {getTaxCodeInfo(parseInt(singleChargeId))?.tax_name}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Rate: {formatPercentage(getTaxCodeInfo(parseInt(singleChargeId))?.rate / 100 || 0)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sale Price Input */}
                  <div className="space-y-2">
                    <Label htmlFor="single-price" className="text-sm font-medium">
                      Sale Price (INR) *
                    </Label>
                    <Input
                      id="single-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter sale price"
                      value={singleSalePrice}
                      onChange={(e) => setSingleSalePrice(e.target.value)}
                      className="dark:bg-gray-900 dark:border-gray-700"
                    />
                    {singleSalePrice && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Amount: <span className="font-semibold">{formatCurrency(parseFloat(singleSalePrice))}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Alert */}
                {singleError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{singleError}</AlertDescription>
                  </Alert>
                )}

                {/* Calculate Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCalculateSingle}
                    disabled={singleLoading || !singleSalePrice || !singleChargeId}
                    className="w-full md:w-auto"
                  >
                    {singleLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Calculate Tax
                      </>
                    )}
                  </Button>
                </div>

                {/* Result Display */}
                {singleResult && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span>✅</span>
                      Tax Calculation Result
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Sale Price Card */}
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Sale Price</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(singleResult.sale_price)}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Tax Rate Card */}
                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Tax Rate</p>
                          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            {formatPercentage(singleResult.tax_rate)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {singleResult.tax_code}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Tax Amount Card */}
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Tax Amount</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(singleResult.tax_amount)}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Total Amount Card */}
                      <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Amount</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(singleResult.total_amount)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Breakdown */}
                    <Card className="bg-gray-50 dark:bg-gray-900/50">
                      <CardHeader>
                        <CardTitle className="text-base">Calculation Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 font-mono text-sm">
                          <div className="flex justify-between">
                            <span>Sale Price</span>
                            <span className="font-semibold">
                              {formatCurrency(singleResult.sale_price)}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>× Tax Rate</span>
                            <span>{formatPercentage(singleResult.tax_rate)}</span>
                          </div>
                          <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-green-600 dark:text-green-400">
                            <span>Tax Amount</span>
                            <span>{formatCurrency(singleResult.tax_amount)}</span>
                          </div>
                          <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-lg text-red-600 dark:text-red-400">
                            <span>Total Amount</span>
                            <span>{formatCurrency(singleResult.total_amount)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Processing */}
          <TabsContent value="batch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Batch Tax Calculation
                </CardTitle>
                <CardDescription>
                  Calculate GST for multiple items and get aggregated totals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Line Items ({batchItems.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddBatchItem}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>

                  {batchItems.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">No items added yet</p>
                      <Button onClick={handleAddBatchItem} variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Charge</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Sale Price</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchItems.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                              <td className="px-4 py-3 text-sm font-mono">{index + 1}</td>
                              <td className="px-4 py-3">
                                <Select
                                  value={String(item.charge_id)}
                                  onValueChange={(val) => handleBatchItemChange(index, 'charge_id', val)}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select charge" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {charges.map((charge: Charge) => (
                                      <SelectItem key={charge.id} value={String(charge.id)}>
                                        {charge.charge_code} - {charge.charge_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={item.sale_price || ''}
                                  onChange={(e) => handleBatchItemChange(index, 'sale_price', e.target.value)}
                                  className="text-sm dark:bg-gray-900 dark:border-gray-700"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveBatchItem(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Error Alert */}
                {batchError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{batchError}</AlertDescription>
                  </Alert>
                )}

                {/* Calculate Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCalculateBatch}
                    disabled={batchLoading || batchItems.length === 0}
                    className="w-full md:w-auto"
                  >
                    {batchLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Calculate All
                      </>
                    )}
                  </Button>
                </div>

                {/* Batch Result Display */}
                {batchResult && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span>✅</span>
                      Batch Calculation Results
                    </h3>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Sale Price</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(batchResult.totals.total_sale_price)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Tax Amount</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(batchResult.totals.total_tax_amount)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Amount</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(batchResult.totals.total_amount)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Itemized Breakdown */}
                    <Card className="bg-gray-50 dark:bg-gray-900/50">
                      <CardHeader>
                        <CardTitle className="text-base">Itemized Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-gray-300 dark:border-gray-600">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium">#</th>
                                <th className="px-3 py-2 text-left font-medium">Charge</th>
                                <th className="px-3 py-2 text-right font-medium">Sale Price</th>
                                <th className="px-3 py-2 text-right font-medium">Tax Rate</th>
                                <th className="px-3 py-2 text-right font-medium">Tax Amount</th>
                                <th className="px-3 py-2 text-right font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batchResult.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800/50">
                                  <td className="px-3 py-2 font-mono">{index + 1}</td>
                                  <td className="px-3 py-2">
                                    <div>
                                      <p className="font-semibold text-primary">{item.tax_code}</p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {getChargeInfo(batchItems[index]?.charge_id)?.charge_name}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {formatCurrency(item.sale_price)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold">
                                    {formatPercentage(item.tax_rate)}
                                  </td>
                                  <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-semibold">
                                    {formatCurrency(item.tax_amount)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(item.total_amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Master Reference */}
          <TabsContent value="reference" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Active Tax Codes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Active Tax Codes (Tax Master)
                  </CardTitle>
                  <CardDescription>
                    Reference of all active tax codes available in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taxCodes.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No tax codes configured</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Tax Code</th>
                            <th className="px-4 py-3 text-left font-medium">Tax Name</th>
                            <th className="px-4 py-3 text-center font-medium">Rate</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-left font-medium">Applicability</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxCodes.map((tax: TaxCode) => (
                            <tr key={tax.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                              <td className="px-4 py-3">
                                <span className="font-mono font-bold text-primary">{tax.tax_code}</span>
                              </td>
                              <td className="px-4 py-3">{tax.tax_name}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant="secondary" className="font-bold">
                                  {tax.rate}%
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm">{tax.tax_type}</td>
                              <td className="px-4 py-3 text-sm">{tax.applicability}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge
                                  variant={tax.is_active ? 'default' : 'secondary'}
                                  className={tax.is_active ? 'bg-green-600' : 'bg-gray-400'}
                                >
                                  {tax.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charge to Tax Mapping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🔗</span>
                    Charge to Tax Mapping (Charge Master)
                  </CardTitle>
                  <CardDescription>
                    Shows the default tax assigned to each charge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {charges.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No charges configured</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Charge Code</th>
                            <th className="px-4 py-3 text-left font-medium">Charge Name</th>
                            <th className="px-4 py-3 text-left font-medium">Default Tax Code</th>
                            <th className="px-4 py-3 text-center font-medium">Tax Rate</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {charges.map((charge: Charge) => (
                            <tr key={charge.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                              <td className="px-4 py-3">
                                <span className="font-mono font-bold text-primary">{charge.charge_code}</span>
                              </td>
                              <td className="px-4 py-3">{charge.charge_name}</td>
                              <td className="px-4 py-3">
                                {charge.defaultTax ? (
                                  <div>
                                    <p className="font-mono font-bold">{charge.defaultTax.tax_code}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {charge.defaultTax.tax_name}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Not assigned</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {charge.defaultTax ? (
                                  <Badge variant="secondary" className="font-bold">
                                    {charge.defaultTax.rate}%
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge
                                  variant={charge.is_active ? 'default' : 'secondary'}
                                  className={charge.is_active ? 'bg-green-600' : 'bg-gray-400'}
                                >
                                  {charge.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Important Notes Section */}
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>ℹ️</span>
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-4">
            <ul className="list-disc list-inside space-y-1">
              <li>Tax rates are retrieved from the Tax Master and cached for performance</li>
              <li>Each charge must have a default tax code configured in Charge Master</li>
              <li>Tax calculations are rounded to 2 decimal places</li>
              <li>Changes to Tax Master rates are automatically reflected in new calculations</li>
              <li>Batch processing aggregates results and provides itemized breakdown</li>
              <li>All calculations follow Indian GST standards (IGST)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
