import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useSelectedWallet } from '@/app/context/SelectedWalletContext';
import { useFormat } from '@/app/context/PreferencesContext';
import { SelectWalletPrompt } from '@/app/components/SelectWalletPrompt';
import { NoWalletsPrompt } from '@/app/components/NoWalletsPrompt';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Gift,
  Clock,
  Filter,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Skeleton } from '../components/ui/skeleton';

export function Transactions() {
  const { selectedAccountId } = useSelectedWallet();
  const { data: accounts } = useAccounts();
  const { data: transactions, isLoading } = useTransactions(selectedAccountId ?? undefined);
  const { formatCurrency, formatDateTime } = useFormat();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => filterType === 'all' || tx.type === filterType)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [transactions, filterType]
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownRight className="w-5 h-5 text-[#089981]" />;
      case 'sell':
        return <ArrowUpRight className="w-5 h-5 text-[#F23645]" />;
      case 'swap':
        return <ArrowLeftRight className="w-5 h-5 text-primary" />;
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5 text-[#9C27B0]" />;
      case 'staking':
        return <Clock className="w-5 h-5 text-[#FF6D00]" />;
      case 'reward':
        return <Gift className="w-5 h-5 text-[#089981]" />;
      default:
        return <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-[#089981]/10 border-[#089981]/20';
      case 'sell':
        return 'bg-[#F23645]/10 border-[#F23645]/20';
      case 'swap':
        return 'bg-primary/10 border-primary/20';
      case 'transfer':
        return 'bg-[#9C27B0]/10 border-[#9C27B0]/20';
      case 'staking':
        return 'bg-[#FF6D00]/10 border-[#FF6D00]/20';
      case 'reward':
        return 'bg-[#089981]/10 border-[#089981]/20';
      default:
        return 'bg-accent border-border';
    }
  };

  const totalVolume = filteredTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.value),
    0
  );
  const totalFees = filteredTransactions.reduce((sum, tx) => sum + tx.fee, 0);

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
          <h2 className="text-2xl font-semibold text-foreground">
            Transactions
          </h2>
          <p className="text-muted-foreground mt-1">
            Complete history of all your transactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Total Transactions
          </div>
          <div className="text-3xl font-semibold text-foreground">
            {filteredTransactions.length}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Total Volume
          </div>
          <div className="text-3xl font-semibold text-foreground">
            {formatCurrency(totalVolume, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Total Fees Paid
          </div>
          <div className="text-3xl font-semibold text-foreground">
            {formatCurrency(totalFees)}
          </div>
        </div>
      </div>

      <div className="bg-card rounded border border-border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="swap">Swap</option>
            <option value="transfer">Transfer</option>
            <option value="staking">Staking</option>
            <option value="reward">Reward</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded border border-border p-6">
        <h3 className="font-semibold text-foreground mb-6">
          Transaction History
        </h3>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet</p>
          ) : (
            filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`flex items-start gap-4 p-4 rounded border ${getTransactionColor(tx.type)}`}
                >
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground capitalize">
                            {tx.type}
                          </span>
                          <span className="text-muted-foreground">
                            {tx.tokenSymbol}
                          </span>
                          {tx.to && (
                            <span className="text-sm text-muted-foreground">
                              → {tx.to}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(tx.timestamp)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${tx.amount >= 0 ? 'text-[#089981]' : 'text-foreground'}`}
                        >
                          {tx.amount >= 0 ? '+' : ''}
                          {tx.amount.toLocaleString('en-US', {
                            maximumFractionDigits: 4,
                          })}{' '}
                          {tx.tokenSymbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(tx.value)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="text-muted-foreground">
                        Price: {formatCurrency(tx.price)}
                      </div>
                      <div className="text-muted-foreground">
                        Fee: {formatCurrency(tx.fee)}
                      </div>
                      {tx.hash && (
                        <div className="text-primary font-mono truncate max-w-[200px]">
                          {tx.hash}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
