import {
  Product,
  Order,
  Review,
  StoreSettings,
  AnalyticsSummary,
  CustomerCRM,
  Lead,
  AdminNotification,
  EmailLog
} from '../types';

const DEFAULT_ADMIN_TOKEN = 'era_token_9f81a7b2c4e6';

export const getAdminAuthToken = (): string => {
  let token = localStorage.getItem('era_admin_token');
  if (!token) {
    token = DEFAULT_ADMIN_TOKEN;
    try {
      localStorage.setItem('era_admin_token', token);
    } catch (_) {}
  }
  return token;
};

const getAuthHeader = (): Record<string, string> => {
  const token = getAdminAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    'x-admin-token': token
  };
};

async function fetchWithRetry(url: string, options?: RequestInit, retries = 2, delay = 300): Promise<Response> {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw err;
  }
}

export const api = {
  // Products
  async getProducts(params?: Record<string, string>): Promise<Product[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithRetry(`/api/products${query ? `?${query}` : ''}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const res = await fetchWithRetry(`/api/products/${encodeURIComponent(idOrSlug)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/products?admin_token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const token = getAdminAuthToken();
    const encodedId = encodeURIComponent(id.trim());
    const res = await fetch(`/api/products/${encodedId}?admin_token=${token}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async duplicateProduct(id: string): Promise<Product> {
    const token = getAdminAuthToken();
    const encodedId = encodeURIComponent(id.trim());
    const res = await fetch(`/api/products/${encodedId}/duplicate?admin_token=${token}`, {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to duplicate product');
    }
    return res.json();
  },

  async toggleProductSold(id: string, isSold?: boolean): Promise<Product> {
    const token = getAdminAuthToken();
    const encodedId = encodeURIComponent(id.trim());
    const res = await fetch(`/api/products/${encodedId}/sold?admin_token=${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ isSold })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product sold status');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
    const token = getAdminAuthToken();
    const cleanId = id.trim();
    const encodedId = encodeURIComponent(cleanId);

    // Primary attempt: DELETE /api/products/:id
    let res = await fetch(`/api/products/${encodedId}?admin_token=${token}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    // Fallback attempt: POST /api/products/:id/delete
    if (!res.ok && res.status !== 404) {
      res = await fetch(`/api/products/${encodedId}/delete?admin_token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete product (${res.status})`);
    }
    return res.json();
  },

  async bulkSetSold(ids: string[], isSold: boolean): Promise<void> {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/products/bulk-sold?admin_token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ ids, isSold })
    });
    if (!res.ok) throw new Error('Failed to perform bulk sold action');
  },

  async bulkDelete(ids: string[]): Promise<{ success: boolean; count: number }> {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/products/bulk-delete?admin_token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to bulk delete products');
    }
    return res.json();
  },

  // Orders & Invoices
  async createOrder(data: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetchWithRetry(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async getOrderByToken(token: string): Promise<Order> {
    const res = await fetchWithRetry(`/api/orders/access/${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Invoice or order not found');
    return res.json();
  },

  async submitBankPayment(orderId: string, proofDataUrl?: string, fileName?: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/submit-bank-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofDataUrl, fileName })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit payment confirmation');
    }
    return res.json();
  },

  async verifyPayment(orderId: string, adminEmail = 'admin@eragadgets.ng'): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ adminEmail })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment verification failed');
    }
    return res.json();
  },

  async getOrders(q?: string): Promise<Order[]> {
    const res = await fetchWithRetry(`/api/orders${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async updateOrderStatus(id: string, orderStatus: string, paymentStatus?: string, adminNote?: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ orderStatus, paymentStatus, adminNote })
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  // Customers CRM
  async getCustomers(q?: string): Promise<CustomerCRM[]> {
    const res = await fetchWithRetry(`/api/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomer(id: string): Promise<{ customer: CustomerCRM; orders: Order[] }> {
    const res = await fetchWithRetry(`/api/customers/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch customer profile');
    return res.json();
  },

  async updateCustomerNotes(id: string, notes: string, status?: string): Promise<CustomerCRM> {
    const res = await fetch(`/api/customers/${id}/notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ notes, status })
    });
    if (!res.ok) throw new Error('Failed to update customer notes');
    return res.json();
  },

  // Leads & Inquiries
  async getLeads(q?: string): Promise<Lead[]> {
    const res = await fetchWithRetry(`/api/leads${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  async createLead(data: Partial<Lead>): Promise<{ success: boolean; lead: Lead }> {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit enquiry');
    }
    return res.json();
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    const res = await fetchWithRetry('/api/notifications', {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
  },

  // Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetchWithRetry('/api/settings', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async resetHomeConfig(): Promise<StoreSettings> {
    const res = await fetch('/api/settings/home-config/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!res.ok) throw new Error('Failed to reset homepage layout');
    return res.json();
  },

  async uploadImage(dataUrl: string, name?: string): Promise<string> {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ data: dataUrl, name })
      });
      if (res.ok) {
        const body = await res.json();
        if (body.url) return body.url;
      }
    } catch (e) {
      console.warn('Backend image upload fallback to data URL:', e);
    }
    return dataUrl;
  },

  async uploadFromUrl(imageUrl: string, name?: string): Promise<string> {
    const token = getAdminAuthToken();
    try {
      const res = await fetch(`/api/upload-from-url?admin_token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ url: imageUrl, name })
      });
      if (res.ok) {
        const body = await res.json();
        if (body.url) return body.url;
      }
    } catch (e) {
      console.warn('Backend upload-from-url fallback:', e);
    }
    return imageUrl;
  },

  // Reviews
  async getReviews(productId?: string, all = false): Promise<Review[]> {
    const q = new URLSearchParams();
    if (productId) q.set('productId', productId);
    if (all) q.set('all', 'true');
    const res = await fetchWithRetry(`/api/reviews?${q.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async submitReview(data: Partial<Review>): Promise<{ message: string; review: Review }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update review');
    return res.json();
  },

  async deleteReview(id: string): Promise<void> {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete review');
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetchWithRetry('/api/analytics', {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid credentials');
    }
    const data = await res.json();
    localStorage.setItem('era_admin_token', data.token);
    return data;
  },

  async checkAuth() {
    const res = await fetch('/api/auth/me', {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  logout() {
    localStorage.removeItem('era_admin_token');
  },

  // Email Notifications
  async sendTestEmail(targetEmail?: string): Promise<{ success: boolean; message: string; log: EmailLog }> {
    const res = await fetch('/api/settings/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ targetEmail })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send test email');
    }
    return res.json();
  },

  async getEmailLogs(): Promise<EmailLog[]> {
    const res = await fetchWithRetry('/api/email-logs', {
      cache: 'no-store',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch email logs');
    return res.json();
  }
};
