'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message || `API Error: ${status}`);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  opts?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    auth?: boolean;
  },
): Promise<T> {
  const method = opts?.method ?? 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opts?.auth !== false) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data, data?.message?.message || data?.message);
  }

  return data;
}

// Token management
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lemni_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lemni_refresh_token');
}

function setTokens(accessToken: string, refreshToken: string, merchant?: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lemni_access_token', accessToken);
  localStorage.setItem('lemni_refresh_token', refreshToken);
  if (merchant) {
    localStorage.setItem('lemni_merchant', JSON.stringify(merchant));
  }
}

function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('lemni_access_token');
  localStorage.removeItem('lemni_refresh_token');
  localStorage.removeItem('lemni_merchant');
  localStorage.removeItem('isAuthenticated');
}

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    return apiFetch<{
      accessToken: string;
      refreshToken: string;
      merchant: { id: string; email: string; name: string };
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  },

  async signup(email: string, password: string, name: string) {
    return apiFetch<{ id: string; email: string; name: string; username: string }>(
      '/auth/signup',
      {
        method: 'POST',
        body: { email, password, name },
        auth: false,
      },
    );
  },

  async refresh(refreshToken: string) {
    return apiFetch<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
  },

  async logout() {
    return apiFetch<{ message: string }>('/auth/logout', { method: 'POST', auth: true });
  },

  async forgotPassword(email: string) {
    return apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  },

  async verifyResetOtp(email: string, code: string) {
    return apiFetch<{ success: boolean; token: string }>('/auth/verify-reset-otp', {
      method: 'POST',
      body: { email, code },
      auth: false,
    });
  },

  async resetPasswordWithToken(token: string, newPassword: string) {
    return apiFetch<{ success: boolean; message: string }>('/auth/reset-password-with-token', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    });
  },

  async telegramLink() {
    return apiFetch<{ telegramUrl: string }>('/auth/telegram-link', {
      method: 'GET',
      auth: true,
    });
  },
};

// API Keys API
export const apiKeysApi = {
  async create(environment: 'test' | 'live') {
    return apiFetch<{ rawKey: string; keyId: string; message: string }>('/admin/api-keys', {
      method: 'POST',
      body: { environment },
      auth: true,
    });
  },

  async list() {
    return apiFetch<Array<{ id: string; environment: string; isActive: boolean; createdAt: string | null }>>(
      '/admin/api-keys',
      {
        method: 'GET',
        auth: true,
      },
    );
  },

  async revoke(id: string) {
    return apiFetch<{ success: boolean; message: string }>(`/admin/api-keys/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

// Billing API
export interface PlanRow {
  id: string;
  merchantId: string;
  name: string;
  amount: number;
  billingModel: 'recurring' | 'one_time' | 'custom_input';
  interval: 'weekly' | 'monthly' | 'yearly' | null;
  trialDays: number;
  trialRequireCard: boolean;
  gracePeriodDays: number;
  createdAt: string | null;
}

export const billingApi = {
  async listPlans() {
    return apiFetch<PlanRow[]>('/admin/plans', { method: 'GET', auth: true });
  },

  async createPlan(data: {
    name: string;
    amount: number;
    billingModel?: string;
    interval?: string;
    trialDays?: number;
    trialRequireCard?: boolean;
    gracePeriodDays?: number;
  }) {
    return apiFetch<PlanRow>('/admin/plans', {
      method: 'POST',
      body: data,
      auth: true,
    });
  },

  async updatePlan(
    id: string,
    data: {
      name?: string;
      amount?: number;
      billingModel?: string;
      interval?: string;
      trialDays?: number;
      trialRequireCard?: boolean;
      gracePeriodDays?: number;
    },
  ) {
    return apiFetch<PlanRow>(`/admin/plans/${id}`, {
      method: 'PUT',
      body: data,
      auth: true,
    });
  },

  async deletePlan(id: string) {
    return apiFetch(`/admin/plans/${id}`, { method: 'DELETE', auth: true });
  },

  async getTransactions(filters?: {
    status?: string;
    customerId?: string;
    subscriptionId?: string;
    startDate?: string;
    endDate?: string;
    limit?: string;
    offset?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return apiFetch<{
      data: Array<{
        id: string;
        merchantId: string;
        customerId: string;
        subscriptionId: string | null;
        amount: number;
        status: 'pending' | 'success' | 'failed';
        nombaRef: string | null;
        createdAt: string;
      }>;
      pagination: { total: number; limit: number; offset: number };
    }>(`/admin/transactions?${params.toString()}`, {
      method: 'GET',
      auth: true,
    });
  },

  async getCheckoutLink(planId: string) {
    return apiFetch<{ checkoutUrl: string; planId: string }>(`/admin/plans/${planId}/checkout-link`, {
      method: 'GET',
      auth: true,
    });
  },

  async getDashboardStats() {
    return apiFetch<{
      mrr: number;
      activeSubscriptions: number;
      churnRate: number;
      recentVolume: number;
    }>('/admin/dashboard/stats', {
      method: 'GET',
      auth: true,
    });
  },

  async reactivateSubscription(id: string) {
    return apiFetch(`/admin/subscriptions/${id}/reactivate`, {
      method: 'POST',
      auth: true,
    });
  },
};

// Checkout API
export const checkoutApi = {
  async getPlanDetails(planId: string) {
    return apiFetch<{
      name: string;
      amount: number;
      billingModel: string;
      interval: string | null;
      trialDays: number;
    }>(`/api/v1/checkout/plans/${planId}`, {
      method: 'GET',
      auth: false,
    });
  },

  async publicPlanCheckout(planId: string, data: { email: string; callbackUrl?: string }) {
    return apiFetch<{ sessionId: string; subscriptionId: string; checkoutUrl: string }>(
      `/api/v1/checkout/plans/${planId}/sessions`,
      {
        method: 'POST',
        body: data,
        auth: false,
      },
    );
  },

  async sessionStatus(sessionId: string) {
    return apiFetch<{
      sessionId: string;
      amount: number;
      status: 'pending' | 'success' | 'failed';
      nombaRef: string | null;
      createdAt: string | null;
    }>(`/api/v1/sessions/${sessionId}/status`, {
      method: 'GET',
      auth: false,
    });
  },

  async unsubscribeRequest(subscriptionId: string, email: string) {
    return apiFetch<{ success: boolean; message: string }>(
      `/api/v1/public/subscriptions/${subscriptionId}/unsubscribe/request`,
      {
        method: 'POST',
        body: { email },
        auth: false,
      },
    );
  },

  async unsubscribeConfirm(subscriptionId: string, code: string) {
    return apiFetch<{ success: boolean; message: string }>(
      `/api/v1/public/subscriptions/${subscriptionId}/unsubscribe/confirm`,
      {
        method: 'POST',
        body: { code },
        auth: false,
      },
    );
  },

  async updatePaymentMethod(subscriptionId: string, email: string) {
    return apiFetch<{ sessionId: string; checkoutUrl: string }>(
      `/api/v1/public/subscriptions/${subscriptionId}/update-payment-method`,
      {
        method: 'POST',
        body: { email },
        auth: false,
      },
    );
  },
};

// Telegram API
export const telegramApi = {
  async status() {
    return apiFetch<{ connected: boolean; connectedAt: string | null; chatId: string | null }>(
      '/api/v1/admin/telegram/status',
      {
        method: 'GET',
        auth: true,
      },
    );
  },

  async disconnect() {
    return apiFetch<{ success: boolean; message: string }>(
      '/api/v1/admin/telegram/disconnect',
      {
        method: 'DELETE',
        auth: true,
      },
    );
  },
};

// DLQ API
export interface DlqJobRow {
  id: string;
  subscriptionId: string | null;
  payload: Record<string, unknown> | null;
  errorReason: string;
  retryHistory: unknown[];
  failedAt: string | null;
}

export const dlqApi = {
  async list() {
    return apiFetch<DlqJobRow[]>('/admin/dlq', { method: 'GET', auth: true });
  },

  async replay(jobId: string) {
    return apiFetch(`/admin/dlq/${jobId}/replay`, {
      method: 'POST',
      auth: true,
    });
  },
};

// AI Plan Builder (local Next.js route, not the Lemni Engine backend)
export const aiApi = {
  async generatePlan(prompt: string) {
    const token = getAccessToken();
    const response = await fetch('/api/admin/ai/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(response.status, data, data?.message);
    }
    return data as {
      plan: {
        name: string;
        amount: number;
        billingModel: 'recurring' | 'one_time';
        interval: 'weekly' | 'monthly' | 'yearly';
        trialDays: number;
        trialRequireCard: boolean;
        gracePeriodDays: number;
      };
      warnings: string[];
    };
  },

  // AI Pricing Strategist — generate a full multi-tier pricing ladder from one prompt.
  async generateLadder(prompt: string) {
    const token = getAccessToken();
    const response = await fetch('/api/admin/ai/generate-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(response.status, data, data?.message);
    }
    return data as {
      strategy: string;
      plans: Array<{
        name: string;
        tagline: string;
        amount: number;
        billingModel: 'recurring' | 'one_time';
        interval: 'weekly' | 'monthly' | 'yearly';
        trialDays: number;
        trialRequireCard: boolean;
        gracePeriodDays: number;
      }>;
    };
  },
};

// Export token utilities
export { getAccessToken, getRefreshToken, setTokens, clearTokens };
