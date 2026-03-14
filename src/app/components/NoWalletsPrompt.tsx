import { Wallet, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function NoWalletsPrompt() {
  const location = useLocation();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Wallet className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Add your first wallet to get started
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Connect a wallet or add an account manually to start tracking your crypto portfolio.
      </p>
      <Link
        to="/settings?add=1"
        state={{ from: location.pathname }}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Account
      </Link>
    </div>
  );
}
