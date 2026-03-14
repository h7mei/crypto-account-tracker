import { useAlerts } from '@/hooks/useAlerts';
import { useFormat } from '@/app/context/PreferencesContext';
import {
  Bell,
  BellOff,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { alertsApi } from '@/lib/api';

export function Alerts() {
  const { data: alerts, isLoading, refetch } = useAlerts();
  const { formatShortDateTime } = useFormat();
  const [activeTab, setActiveTab] = useState<
    'all' | 'triggered' | 'pending'
  >('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    type: 'price' as const,
    title: '',
    message: '',
    condition: '',
  });

  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const pendingAlerts = alerts.filter((a) => !a.triggered);
  const filteredAlerts =
    activeTab === 'all'
      ? alerts
      : activeTab === 'triggered'
        ? triggeredAlerts
        : pendingAlerts;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-5 h-5" />;
      case 'portfolio':
        return <DollarSign className="w-5 h-5" />;
      case 'transaction':
        return <Activity className="w-5 h-5" />;
      case 'risk':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string, triggered: boolean) => {
    if (!triggered)
      return 'bg-accent border-border text-muted-foreground';
    switch (type) {
      case 'price':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'portfolio':
        return 'bg-[#089981]/10 border-[#089981]/20 text-[#089981]';
      case 'transaction':
        return 'bg-[#9C27B0]/10 border-[#9C27B0]/20 text-[#9C27B0]';
      case 'risk':
        return 'bg-[#F23645]/10 border-[#F23645]/20 text-[#F23645]';
      default:
        return 'bg-accent border-border text-muted-foreground';
    }
  };

  async function handleCreateAlert(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await alertsApi.create({
        type: form.type,
        title: form.title || `${form.type} Alert`,
        message: form.message || `Alert for ${form.condition}`,
        condition: form.condition || 'N/A',
      });
      setShowCreateModal(false);
      setForm({ type: 'price', title: '', message: '', condition: '' });
      refetch();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create alert'
      );
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDeleteAlert(id: string) {
    try {
      await alertsApi.delete(id);
      refetch();
    } catch {
      // ignore
    }
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
            Alerts & Monitoring
          </h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with price alerts and portfolio events
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Alert
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Alerts</span>
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-semibold text-foreground">
            {alerts.length}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Triggered</span>
            <AlertCircle className="w-5 h-5 text-[#089981]" />
          </div>
          <div className="text-3xl font-semibold text-[#089981]">
            {triggeredAlerts.length}
          </div>
        </div>
        <div className="bg-card rounded border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pending</span>
            <BellOff className="w-5 h-5 text-[#FF6D00]" />
          </div>
          <div className="text-3xl font-semibold text-[#FF6D00]">
            {pendingAlerts.length}
          </div>
        </div>
      </div>

      <div className="bg-card rounded border border-border p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('triggered')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'triggered'
              ? 'bg-[#089981] text-white'
              : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          Triggered ({triggeredAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-[#FF6D00] text-white'
              : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          Pending ({pendingAlerts.length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <p className="text-muted-foreground">No alerts yet</p>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded p-6 ${getAlertColor(alert.type, alert.triggered)}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded flex items-center justify-center ${
                    alert.triggered ? 'bg-background shadow-sm' : 'bg-accent'
                  }`}
                >
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {alert.title}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize ${
                            alert.triggered
                              ? 'bg-[#089981]/10 text-[#089981]'
                              : 'bg-[#FF6D00]/10 text-[#FF6D00]'
                          }`}
                        >
                          {alert.triggered ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Triggered
                            </>
                          ) : (
                            'Pending'
                          )}
                        </span>
                      </div>
                      <p className="text-foreground">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 hover:bg-background/50 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-background text-foreground capitalize">
                      {alert.type}
                    </span>
                    <div className="text-foreground">
                      Condition:{' '}
                      <span className="font-mono">{alert.condition}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatShortDateTime(alert.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded max-w-lg w-full p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Create New Alert
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-accent rounded transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              {createError && (
                <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alert Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as 'price' | 'portfolio' | 'transaction' | 'risk',
                    }))
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="price">Price Alert</option>
                  <option value="portfolio">Portfolio Value Alert</option>
                  <option value="transaction">Transaction Alert</option>
                  <option value="risk">Risk Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. ETH Price Alert"
                  className="w-full px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="e.g. Ethereum reached $3,200"
                  className="w-full px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Condition
                </label>
                <input
                  type="text"
                  value={form.condition}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, condition: e.target.value }))
                  }
                  placeholder="e.g. ETH >= $3,200"
                  className="w-full px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  {createLoading ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
