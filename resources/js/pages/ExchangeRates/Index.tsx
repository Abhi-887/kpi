import { usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Plus, Calendar } from 'lucide-react';

interface Rate {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  source: string;
}

interface PageProps {
  [key: string]: any;
  activePairs?: Record<string, any>;
  recentRates?: Rate[];
  today?: string;
}

export default function ExchangeRatesIndex() {
  const page = usePage<PageProps>();
  const { activePairs = {}, recentRates = [], today } = page.props;

  const pairCount = Object.keys(activePairs).length;
  const currencyCount = Object.values(activePairs).reduce((sum: number, pair: any) => sum + (pair.count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Exchange Rates</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage currency conversion rates</p>
          </div>
          <Link href="/exchange-rates/create">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Update Rates
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Currency Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{pairCount}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {currencyCount} rates configured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{today}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{recentRates.length}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Recent rates visible</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Pairs */}
        {pairCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Active Currency Pairs
              </CardTitle>
              <CardDescription>Currently maintained exchange rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(activePairs).map(([fromCurrency, pair]: [string, any]) => (
                  <Link
                    key={fromCurrency}
                    href={`/exchange-rates/history/${fromCurrency}/INR`}
                    className="group"
                  >
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{fromCurrency}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-blue-600">INR</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                          {pair.count || 0} rate
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        View history →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Rates Table */}
        {recentRates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Recent Exchange Rates
              </CardTitle>
              <CardDescription>Latest 20 rate records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        From
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        To
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Rate
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Effective Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRates.map((rate) => (
                      <tr
                        key={rate.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {rate.from_currency}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {rate.to_currency}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {(rate.rate as unknown as number).toFixed(6)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {new Date(rate.effective_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs capitalize">
                            {rate.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {pairCount === 0 && recentRates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Exchange Rates Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start by adding exchange rates for your currencies.
              </p>
              <Link href="/exchange-rates/create">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Add First Rate
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p>
              ✓ <strong>Historical Accuracy:</strong> Rates are stored with effective dates, ensuring accurate conversions for past quotes and invoices
            </p>
            <p>
              ✓ <strong>Daily Updates:</strong> Use the "Update Rates" button to set today's rates for all currencies
            </p>
            <p>
              ✓ <strong>Automatic Management:</strong> Previous rates are automatically marked inactive when new rates are added
            </p>
            <p>
              ✓ <strong>Audit Trail:</strong> Complete history of all rate changes with source tracking
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
