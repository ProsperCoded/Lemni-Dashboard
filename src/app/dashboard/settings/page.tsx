'use client';

import React, { useEffect, useState } from 'react';
import {
  Key,
  Copy,
  Trash2,
  Check,
  Bell,
  Globe,
  Sliders,
  Send,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { apiKeysApi, authApi, telegramApi, ApiError } from '@/lib/api-client';

interface ApiKeyRow {
  id: string;
  environment: string;
  isActive: boolean;
  createdAt: string | null;
}

export default function SettingsPage() {
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [newKeyEnv, setNewKeyEnv] = useState<'test' | 'live'>('test');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [rawKeyReveal, setRawKeyReveal] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKeysError, setApiKeysError] = useState<string | null>(null);

  // Telegram state
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState<string | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(true);
  const [telegramActionLoading, setTelegramActionLoading] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);

  const loadApiKeys = async () => {
    try {
      setApiKeysLoading(true);
      const keys = await apiKeysApi.list();
      setApiKeys(keys);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load API keys';
      setApiKeysError(message);
    } finally {
      setApiKeysLoading(false);
    }
  };

  const loadTelegramStatus = async () => {
    try {
      setTelegramLoading(true);
      const status = await telegramApi.status();
      setTelegramConnected(status.connected);
      setTelegramChatId(status.chatId);
    } catch (err) {
      console.error('Telegram status error:', err);
    } finally {
      setTelegramLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApiKeys();
    loadTelegramStatus();
  }, []);

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    setApiKeysError(null);
    try {
      const result = await apiKeysApi.create(newKeyEnv);
      setRawKeyReveal(result.rawKey);
      await loadApiKeys();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to generate key';
      setApiKeysError(message);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this API key? Any systems using it will be immediately disconnected.')) return;

    try {
      await apiKeysApi.revoke(id);
      await loadApiKeys();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to revoke key';
      setApiKeysError(message);
    }
  };

  const handleCopyKey = () => {
    if (!rawKeyReveal) return;
    navigator.clipboard.writeText(rawKeyReveal);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleConnectTelegram = async () => {
    setTelegramActionLoading(true);
    setTelegramError(null);
    try {
      const { telegramUrl } = await authApi.telegramLink();
      window.open(telegramUrl, '_blank');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to get Telegram link';
      setTelegramError(message);
    } finally {
      setTelegramActionLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram notifications?')) return;

    setTelegramActionLoading(true);
    setTelegramError(null);
    try {
      await telegramApi.disconnect();
      await loadTelegramStatus();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to disconnect Telegram';
      setTelegramError(message);
    } finally {
      setTelegramActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-sm text-muted">Manage API credentials, webhook configuration, and notification channels.</p>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl">

        {/* API Keys Manager Section */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Key className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">API Credentials</h3>
              <p className="text-xs text-muted">API access tokens for Lemni Billing Engine</p>
            </div>
          </div>

          {apiKeysError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{apiKeysError}</p>
            </div>
          )}

          {rawKeyReveal && (
            <div className="p-4 bg-success-bg border border-success-border rounded-lg space-y-2">
              <p className="text-xs font-bold text-success">This key will not be shown again. Copy it now.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={rawKeyReveal}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-xs font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3 border border-card-border hover:bg-muted-bg rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer bg-card-bg"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  {copiedKey ? 'Copied' : 'Copy'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRawKeyReveal(null)}
                className="text-xs font-semibold text-muted hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}

          {apiKeysLoading ? (
            <div className="flex justify-center py-4">
              <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className={`flex items-center justify-between p-3 border border-card-border rounded-lg ${!key.isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      key.environment === 'live'
                        ? 'bg-success-bg border-success-border text-success'
                        : 'bg-muted-bg border-muted-border text-muted'
                    }`}>
                      {key.environment}
                    </span>
                    {!key.isActive && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-rose-500/10 border-rose-500/20 text-rose-500">
                        revoked
                      </span>
                    )}
                    <span className="text-xs text-muted font-mono">{key.id}</span>
                    <span className="text-[10px] text-muted">
                      {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {key.isActive && (
                    <button
                      type="button"
                      onClick={() => handleRevokeKey(key.id)}
                      className="px-2 py-1 text-xs font-bold border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  )}
                </div>
              ))}

              {apiKeys.length === 0 && (
                <p className="text-xs text-muted text-center py-4">No API keys generated yet.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-card-border">
            <select
              value={newKeyEnv}
              onChange={(e) => setNewKeyEnv(e.target.value as 'test' | 'live')}
              className="px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            >
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>
            <button
              type="button"
              onClick={handleGenerateKey}
              disabled={generatingKey}
              className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
            >
              {generatingKey ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Generate New Key
                </>
              )}
            </button>
          </div>
        </div>

        {/* Webhooks Section - Disabled Placeholder */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Globe className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Webhook Recipient</h3>
              <p className="text-xs text-muted">Lemni Engine events listener configuration</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Webhook Endpoint URL
            </label>
            <input
              type="url"
              disabled
              placeholder="https://example.com/api/webhooks/lemni"
              className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm opacity-50 cursor-not-allowed"
            />
            <span className="text-[10px] text-muted font-medium mt-1.5 block">
              Coming soon — self-service webhook configuration is not yet available.
            </span>
          </div>
        </div>

        {/* Telegram Section */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Bell className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Telegram Notifications</h3>
              <p className="text-xs text-muted">Bot alerts for billing events, failures, and dunning runs</p>
            </div>
          </div>

          {telegramError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{telegramError}</p>
            </div>
          )}

          {telegramLoading ? (
            <div className="flex justify-center py-4">
              <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : telegramConnected ? (
            <div className="flex items-center justify-between p-4 border border-success-border bg-success-bg rounded-lg">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-success-bg border-success-border text-success">
                  Connected
                </span>
                {telegramChatId && (
                  <span className="text-xs text-muted font-mono">{telegramChatId}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleDisconnectTelegram}
                disabled={telegramActionLoading}
                className="px-3 py-2 text-xs font-bold border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                Connect your Telegram account to receive real-time billing alerts.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleConnectTelegram}
                  disabled={telegramActionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                >
                  {telegramActionLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Connect Telegram
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={loadTelegramStatus}
                  className="p-2 rounded-lg border border-card-border hover:bg-muted-bg text-muted hover:text-foreground transition-all duration-200"
                  title="Refresh status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted">
                Tap Start in Telegram, then click Refresh Status.
              </p>
            </div>
          )}
        </div>

        {/* WhatsApp & Grace Period - Disabled Placeholders */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Sliders className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Additional Settings</h3>
              <p className="text-xs text-muted">Coming soon</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                WhatsApp Notification Number
              </label>
              <input
                type="text"
                disabled
                placeholder="+234 000 000 0000"
                className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm opacity-50 cursor-not-allowed"
              />
              <span className="text-[10px] text-muted font-medium mt-1.5 block">Coming soon</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Default Grace Period (Days)
              </label>
              <input
                type="number"
                disabled
                placeholder="0"
                className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm opacity-50 cursor-not-allowed"
              />
              <span className="text-[10px] text-muted font-medium mt-1.5 block">
                Coming soon — configure per-plan grace period when creating a plan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
