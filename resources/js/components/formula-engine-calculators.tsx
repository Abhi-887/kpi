import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface CBMCalculatorProps {
  onResult?: (data: any) => void
  showCalculation?: boolean
}

export function CBMCalculator({ onResult, showCalculation = true }: CBMCalculatorProps) {
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [pieces, setPieces] = useState('1')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    setError('')
    setResult(null)

    if (!length || !width || !height) {
      setError('Please fill in all dimensions')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/formula/calculate-cbm', {
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
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Calculation failed')
        return
      }

      setResult(data.data)
      onResult?.(data.data)
    } catch (err) {
      setError('Failed to calculate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          CBM Calculator
        </CardTitle>
        <CardDescription>Calculate Cubic Meters from dimensions (in cm)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="length">Length (cm)</Label>
            <Input
              id="length"
              type="number"
              placeholder="0.00"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              disabled={loading}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Width (cm)</Label>
            <Input
              id="width"
              type="number"
              placeholder="0.00"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              disabled={loading}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="0.00"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={loading}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pieces">Pieces</Label>
            <Input
              id="pieces"
              type="number"
              placeholder="1"
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
              disabled={loading}
              step="1"
              min="1"
            />
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Button onClick={calculate} disabled={loading} className="w-full">
          {loading ? 'Calculating...' : 'Calculate CBM'}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CBM Result</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.cbm}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">m³</p>
                </div>
              </div>
            </div>

            {showCalculation && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{result.calculation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface VolumetricWeightCalculatorProps {
  onResult?: (data: any) => void
  showCalculation?: boolean
  modes?: Record<string, any>
}

export function VolumetricWeightCalculator({
  onResult,
  showCalculation = true,
  modes = {},
}: VolumetricWeightCalculatorProps) {
  const [cbm, setCbm] = useState('')
  const [mode, setMode] = useState('AIR')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const modeOptions = modes && Object.keys(modes).length > 0 ? modes : {
    AIR: { name: 'Air Freight', factor: 167 },
    SEA_LCL: { name: 'Sea (LCL)', factor: 1000 },
    SEA_FCL: { name: 'Sea (FCL)', factor: 1000 },
    RAIL: { name: 'Rail', factor: 333 },
    ROAD: { name: 'Road', factor: 500 },
  }

  const calculate = async () => {
    setError('')
    setResult(null)

    if (!cbm) {
      setError('Please enter CBM value')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/formula/calculate-volumetric-weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
        },
        body: JSON.stringify({
          cbm: parseFloat(cbm),
          mode,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Calculation failed')
        return
      }

      setResult(data.data)
      onResult?.(data.data)
    } catch (err) {
      setError('Failed to calculate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedMode = modeOptions[mode]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          Volumetric Weight Calculator
        </CardTitle>
        <CardDescription>Calculate weight based on volume and transportation mode</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cbm-input">CBM (m³)</Label>
            <Input
              id="cbm-input"
              type="number"
              placeholder="0.000"
              value={cbm}
              onChange={(e) => setCbm(e.target.value)}
              disabled={loading}
              step="0.001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mode-select">Transportation Mode</Label>
            <Select value={mode} onValueChange={setMode} disabled={loading}>
              <SelectTrigger id="mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(modeOptions).map(([key, value]: [string, any]) => (
                  <SelectItem key={key} value={key}>
                    {value.name} (÷ {value.divisor || value.factor})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Button onClick={calculate} disabled={loading} className="w-full">
          {loading ? 'Calculating...' : 'Calculate Volumetric Weight'}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Volumetric Weight</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.volumetric_weight}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">kg</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{selectedMode?.name}</Badge>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Factor: {selectedMode?.factor}</p>
                </div>
              </div>
            </div>

            {showCalculation && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{result.calculation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ChargeableWeightCalculatorProps {
  onResult?: (data: any) => void
  showCalculation?: boolean
}

export function ChargeableWeightCalculator({ onResult, showCalculation = true }: ChargeableWeightCalculatorProps) {
  const [actualWeight, setActualWeight] = useState('')
  const [volumetricWeight, setVolumetricWeight] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    setError('')
    setResult(null)

    if (!actualWeight || !volumetricWeight) {
      setError('Please fill in both weight values')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/formula/calculate-chargeable-weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
        },
        body: JSON.stringify({
          actual_weight: parseFloat(actualWeight),
          volumetric_weight: parseFloat(volumetricWeight),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Calculation failed')
        return
      }

      setResult(data.data)
      onResult?.(data.data)
    } catch (err) {
      setError('Failed to calculate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Chargeable Weight Calculator
        </CardTitle>
        <CardDescription>Determine the weight to use for freight charges (maximum of actual or volumetric)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="actual-weight">Actual Weight (kg)</Label>
            <Input
              id="actual-weight"
              type="number"
              placeholder="0.00"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              disabled={loading}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="volumetric-weight">Volumetric Weight (kg)</Label>
            <Input
              id="volumetric-weight"
              type="number"
              placeholder="0.00"
              value={volumetricWeight}
              onChange={(e) => setVolumetricWeight(e.target.value)}
              disabled={loading}
              step="0.01"
            />
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Button onClick={calculate} disabled={loading} className="w-full">
          {loading ? 'Calculating...' : 'Calculate Chargeable Weight'}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chargeable Weight</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{result.chargeable_weight}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">kg</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={result.weight_type === 'volumetric' ? 'bg-green-50 dark:bg-green-950' : 'bg-orange-50 dark:bg-orange-950'}>
                    {result.weight_type === 'volumetric' ? '⚖️ Volumetric' : '📦 Actual'}
                  </Badge>
                </div>
              </div>
            </div>

            {showCalculation && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{result.calculation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
