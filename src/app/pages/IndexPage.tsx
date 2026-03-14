import { Link } from 'react-router';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Coins,
  Bell,
  Settings as SettingsIcon,
} from 'lucide-react';

const ICON_COLORS = [
  'from-[#089981] to-[#0BB68A]',
  'from-[#2962FF] to-[#1E40AF]',
  'from-[#FF6D00] to-[#E65100]',
  'from-[#9C27B0] to-[#7B1FA2]',
  'from-[#00BCD4] to-[#0097A7]',
  'from-[#4CAF50] to-[#388E3C]',
  'from-[#607D8B] to-[#455A64]',
];

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/defi', label: 'DeFi', icon: Coins },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function IndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Menu</h2>
        <p className="text-muted-foreground mt-1">Select a section to view</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const gradient = ICON_COLORS[index % ICON_COLORS.length];
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient}`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-medium text-center text-foreground group-hover:text-primary">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
