import { useDefiPositions } from '@/hooks/useDefiPositions';
import { useAccounts } from '@/hooks/useAccounts';
import { useSelectedWallet } from '@/app/context/SelectedWalletContext';
import { useFormat } from '@/app/context/PreferencesContext';
import { SelectWalletPrompt } from '@/app/components/SelectWalletPrompt';
import { NoWalletsPrompt } from '@/app/components/NoWalletsPrompt';
import {
  Coins,
  TrendingUp,
  Droplet,
  DollarSign,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#2962FF',
  '#089981',
  '#F23645',
  '#FF6D00',
  '#9C27B0',
  '#00BCD4',
];

export function DeFi() {
  const { selectedAccountId } = useSelectedWallet();
  const { data: accounts } = useAccounts();
  const { data: defiPositions, isLoading } = useDefiPositions(selectedAccountId ?? undefined);
  const { formatCurrency } = useFormat();

  const totalInvested = defiPositions.reduce((sum, pos) => sum + pos.invested, 0);
  const totalValue = defiPositions.reduce(
    (sum, pos) => sum + pos.currentValue,
    0
  );
  const totalRewards = defiPositions.reduce((sum, pos) => sum + pos.rewards, 0);
  const totalPnL = totalValue - totalInvested;
  const totalROI =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const positionsByType = useMemo(() => {
    const acc: { name: string; value: number }[] = [];
    defiPositions.forEach((pos) => {
      const existing = acc.find((item) => item.name === pos.type);
      if (existing) {
        existing.value += pos.currentValue;
      } else {
        acc.push({ name: pos.type, value: pos.currentValue });
      }
    });
    return acc;
  }, [defiPositions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'staking':
        return <Coins className="w-6 h-6" />;
      case 'liquidity':
        return <Droplet className="w-6 h-6" />;
      case 'lending':
        return <DollarSign className="w-6 h-6" />;
      case 'borrowing':
        return <TrendingUp className="w-6 h-6" />;
      case 'farming':
        return <Flame className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'staking':
        return 'from-primary to-[#1E40AF]';
      case 'liquidity':
        return 'from-[#9C27B0] to-[#7B1FA2]';
      case 'lending':
        return 'from-[#089981] to-[#0BB68A]';
      case 'borrowing':
        return 'from-[#FF6D00] to-[#E65100]';
      case 'farming':
        return 'from-[#F23645] to-[#D32F2F]';
      default:
        return 'from-muted to-accent';
    }
  };

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
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          DeFi Positions
        </h2>
        <p className="text-muted-foreground mt-1">
          Track your staking, liquidity pools, and yield farming
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Total Invested
          </div>
          <div className="text-3xl font-semibold text-foreground">
            {formatCurrency(totalInvested)}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Current Value
          </div>
          <div className="text-3xl font-semibold text-foreground">
            {formatCurrency(totalValue)}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Total Rewards
          </div>
          <div className="text-3xl font-semibold text-[#089981]">
            +{formatCurrency(totalRewards)}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Total ROI
          </div>
          <div className="text-3xl font-semibold text-[#089981]">
            +{totalROI.toFixed(2)}%
          </div>
        </div>
      </div>

      {positionsByType.length > 0 && (
        <div className="bg-card rounded border border-border p-6">
          <h3 className="font-semibold text-foreground mb-6">
            Distribution by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={positionsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${formatCurrency(value / 1000, { maximumFractionDigits: 1 })}k`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {positionsByType.map((_, index) => (
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
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Active Positions</h3>
        {defiPositions.length === 0 ? (
          <p className="text-muted-foreground">No DeFi positions yet</p>
        ) : (
          defiPositions.map((position) => {
            const roi =
              position.invested > 0
                ? ((position.currentValue - position.invested) /
                    position.invested) *
                  100
                : 0;
            return (
              <div
                key={position.id}
                className="bg-card rounded border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded bg-gradient-to-br ${getTypeColor(position.type)} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    {getTypeIcon(position.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {position.protocol}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                            {position.type}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {position.tokens.join(' + ')} • {position.chain}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          {formatCurrency(position.currentValue)}
                        </div>
                        <div className="text-sm text-[#089981] font-medium">
                          +{roi.toFixed(2)}% ROI
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-accent rounded">
                        <div className="text-xs text-muted-foreground mb-1">
                          Invested
                        </div>
                        <div className="font-medium text-foreground">
                          {formatCurrency(position.invested)}
                        </div>
                      </div>
                      <div className="p-3 bg-[#089981]/10 rounded">
                        <div className="text-xs text-[#089981] mb-1">
                          Rewards Earned
                        </div>
                        <div className="font-medium text-foreground">
                          +{formatCurrency(position.rewards)}
                        </div>
                      </div>
                      <div className="p-3 bg-primary/10 rounded">
                        <div className="text-xs text-primary mb-1">APR</div>
                        <div className="font-medium text-foreground">
                          {position.apr.toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-3 bg-[#9C27B0]/10 rounded">
                        <div className="text-xs text-[#9C27B0] mb-1">
                          Annual Yield
                        </div>
                        <div className="font-medium text-foreground">
                          {formatCurrency(
                            (position.invested * position.apr) / 100
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {defiPositions.length > 0 && (
        <div className="bg-card rounded border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Position Summary
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Invested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    APR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rewards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Chain
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {defiPositions.map((position) => (
                  <tr
                    key={position.id}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {position.protocol}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                        {position.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {position.tokens.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-foreground">
                        {formatCurrency(position.invested)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {formatCurrency(position.currentValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary font-medium">
                        {position.apr.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[#089981] font-medium">
                        +{formatCurrency(position.rewards)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-accent text-foreground">
                        {position.chain}
                      </span>
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
