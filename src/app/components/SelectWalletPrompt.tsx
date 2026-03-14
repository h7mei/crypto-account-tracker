import { Wallet } from 'lucide-react';
import { useSelectedWallet } from '../context/SelectedWalletContext';
import { useAccounts } from '@/hooks/useAccounts';

export function SelectWalletPrompt() {
  const { setSelectedAccountId } = useSelectedWallet();
  const { data: accounts } = useAccounts();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Wallet className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Select a wallet to view your portfolio data
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Choose a wallet from the dropdown in the header to see your holdings, transactions, and analytics.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {accounts.map((acc) => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {acc.name}
          </button>
        ))}
      </div>
    </div>
  );
}
