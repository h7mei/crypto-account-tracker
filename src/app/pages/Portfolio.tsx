import { useHoldings } from '@/hooks/useHoldings';
import { useAccounts } from '@/hooks/useAccounts';
import { useSelectedWallet } from '@/app/context/SelectedWalletContext';
import { useFormat } from '@/app/context/PreferencesContext';
import { SelectWalletPrompt } from '@/app/components/SelectWalletPrompt';
import { NoWalletsPrompt } from '@/app/components/NoWalletsPrompt';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Skeleton } from '../components/ui/skeleton';

const COLORS = [
  '#2962FF',
  '#089981',
  '#F23645',
  '#FF6D00',
  '#9C27B0',
  '#00BCD4',
  '#4CAF50',
  '#FF9800',
];

function getAssetAllocation(holdings: { symbol: string; value: number }[]) {
  const total = holdings.reduce((sum, t) => sum + t.value, 0);
  return holdings
    .map((t) => ({
      name: t.symbol,
      value: t.value,
      percentage: total > 0 ? (t.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function getChainAllocation(holdings: { chain: string; value: number }[]) {
  const chainValues: Record<string, number> = {};
  holdings.forEach((t) => {
    chainValues[t.chain] = (chainValues[t.chain] || 0) + t.value;
  });
  const total = Object.values(chainValues).reduce((s, v) => s + v, 0);
  return Object.entries(chainValues)
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function Portfolio() {
  const { selectedAccountId } = useSelectedWallet();
  const { data: accounts } = useAccounts();
  const { data: holdings, isLoading } = useHoldings(selectedAccountId ?? undefined);
  const { formatCurrency } = useFormat();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'change'>('value');

  const filteredHoldings = useMemo(
    () =>
      holdings
        .filter(
          (h) =>
            h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === 'value') return b.value - a.value;
          return b.change24h - a.change24h;
        }),
    [holdings, searchQuery, sortBy]
  );

  const totalValue = filteredHoldings.reduce((sum, h) => sum + h.value, 0);
  const assetAllocation = useMemo(
    () => getAssetAllocation(holdings),
    [holdings]
  );
  const chainAllocation = useMemo(
    () => getChainAllocation(holdings),
    [holdings]
  );

  if (accounts.length === 0) {
    return <NoWalletsPrompt />;
  }

  if (!selectedAccountId) {
    return <SelectWalletPrompt />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Portfolio</h2>
          <p className="text-muted-foreground mt-1">
            Track your crypto holdings across all accounts
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Total Holdings Value
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      <div className="bg-card rounded border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'value' | 'change')}
            className="px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="value">Sort by Value</option>
            <option value="change">Sort by Change</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Asset Allocation
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetAllocation.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${name} ${percentage.toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetAllocation.slice(0, 8).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#2A2E39',
                  border: '1px solid #363A45',
                  borderRadius: '4px',
                  color: '#D1D4DC',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Chain Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chainAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${name} ${percentage.toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chainAllocation.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#2A2E39',
                  border: '1px solid #363A45',
                  borderRadius: '4px',
                  color: '#D1D4DC',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Chain
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHoldings.map((holding) => (
                  <tr
                    key={holding.id}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#1E40AF] flex items-center justify-center text-white font-semibold">
                          {holding.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {holding.symbol}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {holding.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-foreground">
                        {formatCurrency(holding.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-foreground">
                        {holding.balance.toLocaleString('en-US', {
                          maximumFractionDigits: 4,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {formatCurrency(holding.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center gap-1 ${holding.change24h >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}
                      >
                        {holding.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {holding.change24h >= 0 ? '+' : ''}
                          {holding.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {holding.chain}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
