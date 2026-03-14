import { useHoldings } from '@/hooks/useHoldings';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useSelectedWallet } from '@/app/context/SelectedWalletContext';
import { useFormat } from '@/app/context/PreferencesContext';
import { SelectWalletPrompt } from '@/app/components/SelectWalletPrompt';
import { NoWalletsPrompt } from '@/app/components/NoWalletsPrompt';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
} from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '../components/ui/skeleton';

function generateEthPriceHistory() {
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - (41 - i) * 4);
    const basePrice = 3200;
    const variation = Math.sin(i / 4) * 120 + Math.random() * 80;
    return {
      timestamp: date.getTime(),
      price: basePrice + variation,
    };
  });
}

export function Analytics() {
  const { selectedAccountId } = useSelectedWallet();
  const { data: accounts } = useAccounts();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings(selectedAccountId ?? undefined);
  const { data: transactions } = useTransactions(selectedAccountId ?? undefined);
  const { formatCurrency, formatDate, formatShortDate } = useFormat();

  const invested = (() => {
    const buyTypes = ['buy', 'transfer', 'staking', 'reward'];
    return transactions
      .filter((tx) => buyTypes.includes(tx.type) && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.value, 0);
  })();

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const pnlAmount = totalValue - invested;
  const pnlPercentage = invested > 0 ? (pnlAmount / invested) * 100 : 0;

  const assetPerformance = useMemo(
    () =>
      holdings
        .map((h) => ({
          symbol: h.symbol,
          value: h.value,
          change24h: h.change24h,
          pnl: h.value * (h.change24h / 100),
        }))
        .sort((a, b) => b.pnl - a.pnl),
    [holdings]
  );

  const volumeByType = useMemo(() => {
    const acc: { type: string; volume: number; count: number }[] = [];
    transactions.forEach((tx) => {
      const existing = acc.find((item) => item.type === tx.type);
      if (existing) {
        existing.volume += Math.abs(tx.value);
        existing.count += 1;
      } else {
        acc.push({
          type: tx.type,
          volume: Math.abs(tx.value),
          count: 1,
        });
      }
    });
    return acc;
  }, [transactions]);

  const riskMetrics = {
    sharpeRatio: 1.87,
    volatility: 42.5,
    maxDrawdown: -18.3,
    beta: 1.15,
  };

  const profitableTrades = transactions.filter(
    (tx) => (tx.type === 'sell' && tx.amount < 0) || tx.type === 'swap'
  ).length;
  const totalTrades = transactions.filter((tx) =>
    ['buy', 'sell', 'swap'].includes(tx.type)
  ).length;
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

  const ethPriceHistory = useMemo(() => generateEthPriceHistory(), []);

  if (accounts.length === 0) {
    return <NoWalletsPrompt />;
  }

  if (!selectedAccountId) {
    return <SelectWalletPrompt />;
  }

  if (holdingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Analytics & Performance
        </h2>
        <p className="text-muted-foreground mt-1">
          Detailed insights into your portfolio performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Unrealized P&L
            </span>
            {invested > 0 &&
              (pnlAmount >= 0 ? (
                <TrendingUp className="w-5 h-5 text-[#089981]" />
              ) : (
                <TrendingDown className="w-5 h-5 text-[#F23645]" />
              ))}
          </div>
          <div
            className={`text-2xl font-semibold mb-1 ${
              invested === 0
                ? 'text-muted-foreground'
                : pnlAmount >= 0
                  ? 'text-[#089981]'
                  : 'text-[#F23645]'
            }`}
          >
            {invested === 0 ? '—' : `${pnlAmount >= 0 ? '+' : ''}${formatCurrency(pnlAmount)}`}
          </div>
          <div
            className={`text-sm ${invested === 0 ? 'text-muted-foreground' : ''}`}
          >
            {invested === 0 ? 'No cost basis' : `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%`}
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Win Rate</span>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-semibold text-foreground mb-1">
            {winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">
            {profitableTrades}/{totalTrades} trades
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            <Activity className="w-5 h-5 text-[#9C27B0]" />
          </div>
          <div className="text-2xl font-semibold text-foreground mb-1">
            {riskMetrics.sharpeRatio}
          </div>
          <div className="text-sm text-muted-foreground">
            Risk-adjusted return
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Volatility</span>
            <Activity className="w-5 h-5 text-[#FF6D00]" />
          </div>
          <div className="text-2xl font-semibold text-foreground mb-1">
            {riskMetrics.volatility}%
          </div>
          <div className="text-sm text-muted-foreground">
            30-day volatility
          </div>
        </div>
      </div>

      {assetPerformance.length > 0 && (
        <div className="bg-card rounded border border-border p-6">
          <h3 className="font-semibold text-foreground mb-6">
            Asset Performance (24h P&L)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={assetPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#363A45" />
              <XAxis
                dataKey="symbol"
                stroke="#787B86"
                tick={{ fill: '#787B86' }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, { maximumFractionDigits: 0 })}
                stroke="#787B86"
                tick={{ fill: '#787B86' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'P&L']}
                contentStyle={{
                  backgroundColor: '#2A2E39',
                  border: '1px solid #363A45',
                  borderRadius: '4px',
                  color: '#D1D4DC',
                }}
              />
              <Bar dataKey="pnl" fill="#2962FF" radius={[4, 4, 0, 0]}>
                {assetPerformance.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.pnl >= 0 ? '#089981' : '#F23645'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {volumeByType.length > 0 && (
          <div className="bg-card rounded border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">
              Volume by Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#363A45" />
                <XAxis
                  dataKey="type"
                  stroke="#787B86"
                  tick={{ fill: '#787B86' }}
                />
                <YAxis
                  tickFormatter={(value) => `${formatCurrency(value / 1000, { maximumFractionDigits: 0 })}k`}
                  stroke="#787B86"
                  tick={{ fill: '#787B86' }}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Volume']}
                  contentStyle={{
                    backgroundColor: '#2A2E39',
                    border: '1px solid #363A45',
                    borderRadius: '4px',
                    color: '#D1D4DC',
                  }}
                />
                <Bar dataKey="volume" fill="#9C27B0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-card rounded border border-border p-6">
          <h3 className="font-semibold text-foreground mb-6">
            ETH Price (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ethPriceHistory.filter((_, i) => i % 4 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#363A45" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => formatShortDate(timestamp)}
                stroke="#787B86"
                tick={{ fill: '#787B86' }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, { maximumFractionDigits: 0 })}
                stroke="#787B86"
                tick={{ fill: '#787B86' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Price']}
                labelFormatter={(timestamp) => formatDate(timestamp)}
                contentStyle={{
                  backgroundColor: '#2A2E39',
                  border: '1px solid #363A45',
                  borderRadius: '4px',
                  color: '#D1D4DC',
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2962FF"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded border border-border p-6">
        <h3 className="font-semibold text-foreground mb-6">Risk Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-primary/10 rounded border border-primary/20">
            <div className="text-sm text-primary mb-1">Sharpe Ratio</div>
            <div className="text-2xl font-semibold text-foreground">
              {riskMetrics.sharpeRatio}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Higher is better
            </div>
          </div>
          <div className="p-4 bg-[#FF6D00]/10 rounded border border-[#FF6D00]/20">
            <div className="text-sm text-[#FF6D00] mb-1">Volatility</div>
            <div className="text-2xl font-semibold text-foreground">
              {riskMetrics.volatility}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              30-day standard deviation
            </div>
          </div>
          <div className="p-4 bg-[#F23645]/10 rounded border border-[#F23645]/20">
            <div className="text-sm text-[#F23645] mb-1">Max Drawdown</div>
            <div className="text-2xl font-semibold text-foreground">
              {riskMetrics.maxDrawdown}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Peak to trough decline
            </div>
          </div>
          <div className="p-4 bg-[#9C27B0]/10 rounded border border-[#9C27B0]/20">
            <div className="text-sm text-[#9C27B0] mb-1">Beta</div>
            <div className="text-2xl font-semibold text-foreground">
              {riskMetrics.beta}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Market correlation
            </div>
          </div>
        </div>
      </div>

      {assetPerformance.length > 0 && (
        <div className="bg-card rounded border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Asset Rankings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    24h P&L
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assetPerformance.map((asset, index) => (
                  <tr
                    key={asset.symbol}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {asset.symbol}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-foreground">
                        {formatCurrency(asset.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center gap-1 ${asset.change24h >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}
                      >
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {asset.change24h >= 0 ? '+' : ''}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`font-medium ${asset.pnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}
                      >
                        {asset.pnl >= 0 ? '+' : ''}
                        {formatCurrency(asset.pnl)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
