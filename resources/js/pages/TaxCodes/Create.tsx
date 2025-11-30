import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface FormData {
  tax_code: string
  tax_name: string
  rate: string
  tax_type: string
  applicability: string
  jurisdiction: string
  effective_from: string
  effective_to: string
  is_active: boolean
}

export default function CreateTaxCode() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tax Codes', href: '/tax-codes' },
    { title: 'Create', href: '#' },
  ]

  const [formData, setFormData] = useState<FormData>({
    tax_code: '',
    tax_name: '',
    rate: '',
    tax_type: 'IGST',
    applicability: 'Both',
    jurisdiction: '',
    effective_from: '',
    effective_to: '',
    is_active: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    router.post('/tax-codes', formData, {
      onError: (errors) => {
        setErrors(errors as Record<string, string>)
        setLoading(false)
      },
      onSuccess: () => {
        setLoading(false)
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Tax Code" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.visit('/tax-codes')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Add Tax Code</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tax Code Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_code">Tax Code *</Label>
                  <Input
                    id="tax_code"
                    name="tax_code"
                    value={formData.tax_code}
                    onChange={handleChange}
                    placeholder="e.g., GST-0"
                    className={errors.tax_code ? 'border-red-500' : ''}
                  />
                  {errors.tax_code && (
                    <p className="text-sm text-red-500">{errors.tax_code}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_name">Tax Name *</Label>
                  <Input
                    id="tax_name"
                    name="tax_name"
                    value={formData.tax_name}
                    onChange={handleChange}
                    placeholder="e.g., 0% GST"
                    className={errors.tax_name ? 'border-red-500' : ''}
                  />
                  {errors.tax_name && (
                    <p className="text-sm text-red-500">{errors.tax_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (%) *</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={errors.rate ? 'border-red-500' : ''}
                  />
                  {errors.rate && (
                    <p className="text-sm text-red-500">{errors.rate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_type">Tax Type *</Label>
                  <Select value={formData.tax_type} onValueChange={(value) => handleSelectChange('tax_type', value)}>
                    <SelectTrigger className={errors.tax_type ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IGST">IGST</SelectItem>
                      <SelectItem value="CGST">CGST</SelectItem>
                      <SelectItem value="SGST">SGST</SelectItem>
                      <SelectItem value="VAT">VAT</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tax_type && (
                    <p className="text-sm text-red-500">{errors.tax_type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicability">Applicability *</Label>
                  <Select value={formData.applicability} onValueChange={(value) => handleSelectChange('applicability', value)}>
                    <SelectTrigger className={errors.applicability ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sale">Sale</SelectItem>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.applicability && (
                    <p className="text-sm text-red-500">{errors.applicability}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    name="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={handleChange}
                    placeholder="e.g., India"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_from">Effective From *</Label>
                  <Input
                    id="effective_from"
                    name="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={handleChange}
                    className={errors.effective_from ? 'border-red-500' : ''}
                  />
                  {errors.effective_from && (
                    <p className="text-sm text-red-500">{errors.effective_from}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_to">Effective To</Label>
                  <Input
                    id="effective_to"
                    name="effective_to"
                    type="date"
                    value={formData.effective_to}
                    onChange={handleChange}
                    className={errors.effective_to ? 'border-red-500' : ''}
                  />
                  {errors.effective_to && (
                    <p className="text-sm text-red-500">{errors.effective_to}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked as boolean }))
                  }
                />
                <Label htmlFor="is_active" className="font-medium cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? 'Creating...' : 'Create Tax Code'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/tax-codes')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
