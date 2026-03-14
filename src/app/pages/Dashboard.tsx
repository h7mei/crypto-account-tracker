import { useHoldings } from '@/hooks/useHoldings';
import { useDefiPositions } from '@/hooks/useDefiPositions';
import { useTransactions } from '@/hooks/useTransactions';
import { useAlerts } from '@/hooks/useAlerts';
import { useAccounts } from '@/hooks/useAccounts';
import { useSelectedWallet } from '@/app/context/SelectedWalletContext';
import { useFormat } from '@/app/context/PreferencesContext';
import { SelectWalletPrompt } from '@/app/components/SelectWalletPrompt';
import { NoWalletsPrompt } from '@/app/components/NoWalletsPrompt';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '../components/ui/skeleton';

function getTopMovers(holdings: { change24h: number; symbol: string; name: string; price: number; id: string }[]) {
  const sorted = [...holdings].sort(
    (a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)
  );
  return {
    gainers: sorted.filter((t) => t.change24h > 0).slice(0, 3),
    losers: sorted.filter((t) => t.change24h < 0).slice(0, 3),
  };
}

function generatePortfolioHistory(totalValue: number) {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const variation = Math.sin(i / 5) * (totalValue * 0.05) + Math.random() * (totalValue * 0.02);
    return {
      timestamp: date.getTime(),
      value: Math.max(0, totalValue + variation),
    };
  });
}

export function Dashboard() {
  const { selectedAccountId } = useSelectedWallet();
  const { data: accounts } = useAccounts();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings(selectedAccountId ?? undefined);
  const { data: defiPositions, isLoading: defiLoading } = useDefiPositions(selectedAccountId ?? undefined);
  const { data: transactions } = useTransactions(selectedAccountId ?? undefined);
  const { data: alerts, isLoading: alertsLoading } = useAlerts();
  const { formatCurrency, formatDate, formatShortDate, formatShortDateTime } = useFormat();

  const invested = (() => {
    const buyTypes = ['buy', 'transfer', 'staking', 'reward'];
    return transactions
      .filter((tx) => buyTypes.includes(tx.type) && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.value, 0);
  })();

  const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const defiValue = defiPositions.reduce((sum, d) => sum + d.currentValue, 0);
  const totalValue = holdingsValue + defiValue;
  const pnlAmount = totalValue - invested;
  const pnlPercentage = invested > 0 ? (pnlAmount / invested) * 100 : 0;

  const { gainers, losers } = useMemo(
    () => getTopMovers(holdings),
    [holdings]
  );
  const triggeredAlerts = alerts.filter((a) => a.triggered).slice(0, 3);
  const portfolioHistory = useMemo(
    () => generatePortfolioHistory(totalValue),
    [totalValue]
  );

  const [animatedValue, setAnimatedValue] = useState(totalValue);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    setAnimatedValue(totalValue);
  }, [totalValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 500;
      setPriceChange(change);
      setAnimatedValue((prev) => prev + change);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (accounts.length === 0) {
    return <NoWalletsPrompt />;
  }

  if (!selectedAccountId) {
    return <SelectWalletPrompt />;
  }

  const isLoading = holdingsLoading || defiLoading || alertsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your portfolio overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Total Portfolio Value
            </span>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">
            {formatCurrency(animatedValue)}
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}
          >
            {priceChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{formatCurrency(Math.abs(priceChange))} (24h)</span>
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Total Profit/Loss
            </span>
            {invested > 0 ? (
              pnlAmount >= 0 ? (
                <TrendingUp className="w-5 h-5 text-[#089981]" />
              ) : (
                <TrendingDown className="w-5 h-5 text-[#F23645]" />
              )
            ) : null}
          </div>
          <div
            className={`text-3xl font-semibold mb-1 ${
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
            className={`flex items-center gap-1 text-sm ${
              invested === 0
                ? 'text-muted-foreground'
                : pnlPercentage >= 0
                  ? 'text-[#089981]'
                  : 'text-[#F23645]'
            }`}
          >
            {invested === 0 ? 'No cost basis' : `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}% ROI`}
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Holdings</span>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">
            {formatCurrency(holdingsValue)}
          </div>
          <div className="text-sm text-muted-foreground">
            {holdings.length} assets
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              DeFi Positions
            </span>
            <Activity className="w-5 h-5 text-[#FF6D00]" />
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">
            {formatCurrency(defiValue)}
          </div>
          <div className="text-sm text-muted-foreground">
            {defiPositions.length} positions
          </div>
        </div>
      </div>

      <div className="bg-card rounded border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">
              Portfolio Performance
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm rounded bg-primary text-white font-medium">
              30D
            </button>
            <button className="px-3 py-1.5 text-sm rounded text-muted-foreground hover:bg-accent hover:text-foreground">
              90D
            </button>
            <button className="px-3 py-1.5 text-sm rounded text-muted-foreground hover:bg-accent hover:text-foreground">
              1Y
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={portfolioHistory}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2962FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2962FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#363A45" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => formatShortDate(timestamp)}
              stroke="#787B86"
              tick={{ fill: '#787B86' }}
            />
            <YAxis
              tickFormatter={(value) => `${formatCurrency(value / 1000, { maximumFractionDigits: 0 })}k`}
              stroke="#787B86"
              tick={{ fill: '#787B86' }}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelFormatter={(timestamp) => formatDate(timestamp)}
              contentStyle={{
                backgroundColor: '#2A2E39',
                border: '1px solid #363A45',
                borderRadius: '4px',
                color: '#D1D4DC',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2962FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Top Gainers (24h)</h3>
            <Link to="/portfolio" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {gainers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No gainers yet</p>
            ) : (
              gainers.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 rounded bg-[#089981]/10 border border-[#089981]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#089981] to-[#0BB68A] flex items-center justify-center text-white font-semibold">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {token.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#089981]">
                      +{token.change24h.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(token.price)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Alerts</h3>
            <Link to="/alerts" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {triggeredAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No alerts yet</p>
            ) : (
              triggeredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded bg-primary/10 border border-primary/20"
                >
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {alert.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {alert.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatShortDateTime(alert.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
