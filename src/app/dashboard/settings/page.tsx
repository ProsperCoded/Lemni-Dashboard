'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Trash2, 
  Check, 
  Bell, 
  Globe, 
  Sliders, 
  Eye, 
  EyeOff, 
  CheckCircle 
} from 'lucide-react';

export default function SettingsPage() {
  // Webhook and notifications state
  const [webhookUrl, setWebhookUrl] = useState('https://bananafitness.com/api/webhooks/lemni');
  const [whatsappNumber, setWhatsappNumber] = useState('+234 812 345 6789');
  const [telegramToken, setTelegramToken] = useState('719283940:AAH8291-xk8201');
  const [telegramChatId, setTelegramChatId] = useState('48291039');
  const [emailNotify, setEmailNotify] = useState('billing@bananafitness.com');
  const [defaultGracePeriod, setDefaultGracePeriod] = useState(5);
  
  // API Key state
  const [publicKey, setPublicKey] = useState('pk_live_829a8f4c01d9f848c4b9247');
  const [secretKey, setSecretKey] = useState('sk_live_9038d1283afeb9102c48d28');
  const [showSecret, setShowSecret] = useState(false);
  const [copiedPub, setCopiedPub] = useState(false);
  const [copiedSec, setCopiedSec] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Copy helpers
  const handleCopyPub = () => {
    navigator.clipboard.writeText(publicKey);
    setCopiedPub(true);
    setTimeout(() => setCopiedPub(false), 1500);
  };

  const handleCopySec = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSec(true);
    setTimeout(() => setCopiedSec(false), 1500);
  };

  // Generate new keys
  const handleGenerateKeys = () => {
    const randomHex = (len: number) => Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setPublicKey(`pk_live_${randomHex(24)}`);
    setSecretKey(`sk_live_${randomHex(32)}`);
    setShowSecret(false);
  };

  // Revoke keys
  const handleRevokeKeys = () => {
    if (confirm('Are you sure you want to revoke these API keys? Any systems currently using them will be immediately disconnected.')) {
      setPublicKey('');
      setSecretKey('');
      setShowSecret(false);
    }
  };

  // Handle settings save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-sm text-muted">Configure billing rules, webhook webhooks, bot alerts, and manage API keys.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
        
        {/* API Keys Manager Section */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Key className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">API Credentials</h3>
              <p className="text-xs text-muted">API access tokens for Lemni Billing Engine</p>
            </div>
          </div>

          <div className="space-y-5">
            {publicKey ? (
              <>
                {/* Public Key field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Public API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicKey}
                      className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPub}
                      className="px-3 border border-card-border hover:bg-muted-bg rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {copiedPub ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      {copiedPub ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Secret Key field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Secret API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      readOnly
                      value={secretKey}
                      className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="px-3 border border-card-border hover:bg-muted-bg rounded-lg transition-colors text-muted hover:text-foreground cursor-pointer"
                      title={showSecret ? 'Hide secret key' : 'Show secret key'}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySec}
                      className="px-3 border border-card-border hover:bg-muted-bg rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {copiedSec ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      {copiedSec ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider mt-2.5 block">
                    Warning: Keep your Secret Key secure. Do not share it in client code.
                  </span>
                </div>

                {/* Revoke button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRevokeKeys}
                    className="px-3 py-2 text-xs font-bold border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Revoke & Delete API Keys
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center border border-dashed border-card-border rounded-xl space-y-3">
                <p className="text-xs text-muted">No API Keys generated for this merchant account.</p>
                <button
                  type="button"
                  onClick={handleGenerateKeys}
                  className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors cursor-pointer"
                >
                  Generate Credentials
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Webhooks Section */}
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
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/api/webhooks/lemni"
              className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
            <span className="text-[10px] text-muted font-medium mt-1.5 block">
              Lemni fires events like `subscription.past_due` or `payment.success` to this endpoint.
            </span>
          </div>
        </div>

        {/* Alerts & Telegram/WhatsApp Config */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Bell className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Notification Channels</h3>
              <p className="text-xs text-muted">Bot alert endpoints for failed and successful dunning runs</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  System Alert Email
                </label>
                <input
                  type="email"
                  value={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  WhatsApp Notification Number
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              {/* Telegram Token */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              {/* Telegram Chat ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Business Constraints */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-4">
            <Sliders className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Constraints & Grace periods</h3>
              <p className="text-xs text-muted">Merchant configurations details</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Default Grace Period (Days)
            </label>
            <input
              type="number"
              min="0"
              value={defaultGracePeriod}
              onChange={(e) => setDefaultGracePeriod(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors sm:w-1/3"
            />
            <span className="text-[10px] text-muted font-medium mt-1.5 block">
              Global fallback. Individual plans can override this.
            </span>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-between items-center bg-card-bg border border-card-border rounded-xl p-4 shadow-sm">
          <div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-success animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                Settings saved successfully
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
}
