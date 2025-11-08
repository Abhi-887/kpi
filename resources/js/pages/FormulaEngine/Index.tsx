import React, { useState } from 'react'
import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type BreadcrumbItem } from '@/types'
import { CBMCalculator, VolumetricWeightCalculator, ChargeableWeightCalculator } from '@/components/formula-engine-calculators'
import { Calculator, Zap, BookOpen, ArrowRight } from 'lucide-react'

interface PageProps {
  supportedModes: Record<string, any>
}

export default function FormulaEngineIndex() {
  const { supportedModes } = usePage().props as any as PageProps
  const [cbmResult, setCbmResult] = useState<any>(null)
  const [volumetricResult, setVolumetricResult] = useState<any>(null)
  const [chargeableResult, setChargeableResult] = useState<any>(null)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Formula Engine',
      href: '/formula-engine',
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Formula Engine - Calculations" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-4xl">🧮</span>
              Formula Engine
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Central library for all mathematical and physical calculations</p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  CBM Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Calculate cubic meters from dimensions in centimeters</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">(L × W × H × P) / 1,000,000</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  Volumetric Weight
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Convert volume to weight based on transport mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">CBM × Mode Factor</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  Chargeable Weight
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Determine weight for freight charges</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">max(Actual, Volumetric)</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Calculators Section */}
        <Tabs defaultValue="combined" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="cbm">CBM</TabsTrigger>
            <TabsTrigger value="volumetric">Vol. Weight</TabsTrigger>
            <TabsTrigger value="chargeable">Chargeable</TabsTrigger>
          </TabsList>

          {/* Combined Calculator */}
          <TabsContent value="combined" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Complete Calculation
                  </CardTitle>
                  <CardDescription>Enter shipment details to calculate all metrics at once</CardDescription>
                </CardHeader>
                <CardContent>
                  <CombinedCalculator modes={supportedModes} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Individual Calculators */}
          <TabsContent value="cbm" className="space-y-4">
            <CBMCalculator onResult={setCbmResult} />
          </TabsContent>

          <TabsContent value="volumetric" className="space-y-4">
            <VolumetricWeightCalculator onResult={setVolumetricResult} modes={supportedModes} />
          </TabsContent>

          <TabsContent value="chargeable" className="space-y-4">
            <ChargeableWeightCalculator onResult={setChargeableResult} />
          </TabsContent>
        </Tabs>

        {/* Transportation Modes Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Transportation Modes & Factors
            </CardTitle>
            <CardDescription>Volumetric weight calculation factors by transport mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(supportedModes).map(([mode, data]: [string, any]) => (
                <div key={mode} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
                  <p className="font-semibold text-sm">{data.name}</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.factor}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-500">CBM × {data.factor}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">or CBM ÷ {data.divisor}</p>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {mode}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulas Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Formula Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-xl">1️⃣</span>
                  CBM (Cubic Meter)
                </h3>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    CBM = (Length × Width × Height × Pieces) / 1,000,000
                  </code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All dimensions in centimeters. Result in cubic meters (m³).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-xl">2️⃣</span>
                  Volumetric Weight
                </h3>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    Volumetric Weight = CBM × Mode Factor
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-semibold mb-1">Examples:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• AIR: 5 CBM × 167 = 835 kg</li>
                      <li>• SEA_LCL: 5 CBM × 1000 = 5,000 kg</li>
                      <li>• RAIL: 5 CBM × 333 = 1,665 kg</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Alternative form:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• AIR: 5 CBM ÷ 6,000 = 0.833 kg/unit</li>
                      <li>• SEA_LCL: 5 CBM ÷ 1,000 = 5 kg/unit</li>
                      <li>• ROAD: 5 CBM ÷ 2,000 = 2.5 kg/unit</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-xl">3️⃣</span>
                  Chargeable Weight
                </h3>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    Chargeable Weight = max(Actual Weight, Volumetric Weight)
                  </code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The freight is charged based on whichever is greater. This prevents light, bulky items from being undercharged.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

interface CombinedCalculatorProps {
  modes: Record<string, any>
}

function CombinedCalculator({ modes }: CombinedCalculatorProps) {
  const [length, setLength] = React.useState('')
  const [width, setWidth] = React.useState('')
  const [height, setHeight] = React.useState('')
  const [pieces, setPieces] = React.useState('1')
  const [actualWeight, setActualWeight] = React.useState('')
  const [mode, setMode] = React.useState('AIR')
  const [result, setResult] = React.useState<any>(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const calculate = async () => {
    setError('')
    setResult(null)

    if (!length || !width || !height || !actualWeight) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/formula/calculate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
        },
        body: JSON.stringify({
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
          pieces: pieces ? parseFloat(pieces) : 1,
          actual_weight: parseFloat(actualWeight),
          mode,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Calculation failed')
        return
      }

      setResult(data.data)
    } catch (err) {
      setError('Failed to calculate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Length (cm)</label>
          <input
            type="number"
            placeholder="0.00"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            disabled={loading}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Width (cm)</label>
          <input
            type="number"
            placeholder="0.00"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            disabled={loading}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Height (cm)</label>
          <input
            type="number"
            placeholder="0.00"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            disabled={loading}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Pieces</label>
          <input
            type="number"
            placeholder="1"
            value={pieces}
            onChange={(e) => setPieces(e.target.value)}
            disabled={loading}
            step="1"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Actual Weight (kg)</label>
          <input
            type="number"
            placeholder="0.00"
            value={actualWeight}
            onChange={(e) => setActualWeight(e.target.value)}
            disabled={loading}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Transport Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
          >
            {Object.entries(modes).map(([key, value]: [string, any]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <Button onClick={calculate} disabled={loading} size="lg" className="w-full">
        {loading ? 'Calculating...' : 'Calculate All Metrics'}
      </Button>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">CBM</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.cbm}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">m³</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Volumetric Weight</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.volumetric_weight}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">kg</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Chargeable Weight</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{result.chargeable_weight}</p>
            <Badge className="mt-2" variant={result.weight_type === 'volumetric' ? 'default' : 'secondary'}>
              {result.weight_type === 'volumetric' ? 'Volumetric' : 'Actual'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
