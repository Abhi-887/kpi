import { Form, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PageProps {
  [key: string]: any;
}

interface CurrentRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

interface Props {
  currentRates: CurrentRate[];
  today: string;
  errors?: Record<string, string[]>;
}

export default function ExchangeRatesCreate({ currentRates = [], today, errors }: Props) {
  const { url } = usePage();
  const [rates, setRates] = useState<Record<string, string>>(
    currentRates.reduce((acc, r) => {
      if (r.currency) {
        acc[r.currency] = r.rate?.toString() || '';
      }
      return acc;
    }, {} as Record<string, string>)
  );

  const [newCurrency, setNewCurrency] = useState('');

  const handleRateChange = (currency: string, value: string) => {
    setRates((prev) => ({
      ...prev,
      [currency]: value,
    }));
  };

  const addCurrency = () => {
    if (newCurrency && newCurrency.length === 3) {
      setRates((prev) => ({
        ...prev,
        [newCurrency.toUpperCase()]: '',
      }));
      setNewCurrency('');
    }
  };

  const removeCurrency = (currency: string) => {
    setRates((prev) => {
      const newRates = { ...prev };
      delete newRates[currency];
      return newRates;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Form method="post" action="/exchange-rates" className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Update Exchange Rates</h1>
            <p className="text-slate-600 dark:text-slate-400">Set exchange rates for {today}</p>
          </div>

          {/* Error Messages */}
          {errors && Object.keys(errors).length > 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Validation Errors</h3>
                  <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                    {Object.entries(errors).map(([field, msgs]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {Array.isArray(msgs) ? msgs.join(', ') : msgs}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Exchange Rates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">Exchange Rates (1 {process.env.REACT_APP_BASE_CURRENCY || 'INR'} = ?)</span>
              </CardTitle>
              <CardDescription>Enter rates for each currency from today</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Existing Rates */}
              <div className="space-y-3">
                {Object.entries(rates).map(([currency, rate]) => (
                  <div key={currency} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                        {currency}
                      </Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        placeholder="Enter exchange rate"
                        value={rate}
                        onChange={(e) => handleRateChange(currency, e.target.value)}
                        className="h-10"
                        name={`rates[${currency}]`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCurrency(currency)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Currency */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                      Add Currency
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., USD"
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                      maxLength={3}
                      className="h-10 uppercase"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCurrency();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCurrency}
                    disabled={!newCurrency || newCurrency.length !== 3}
                    className="h-10 w-10 mt-6"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effective Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Effective Date</CardTitle>
              <CardDescription>Leave empty to use today</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                name="effective_date"
                defaultValue={today}
                max={today}
                className="h-10"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={Object.keys(rates).length === 0 || Object.values(rates).some(r => !r)}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              Update Rates
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Rates are stored with historical accuracy. You can look up rates for any past date
              when quoting or invoicing. Previous rates are automatically marked as inactive.
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
