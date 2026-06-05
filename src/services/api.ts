/**
 * Secure Course API Service (Frontend Wrapper)
 * Uses native fetch() to interact with the modular backend.
 */

const BASE_URL = '/api/admin';

class AdminService {
  private getHeaders() {
    const token = localStorage.getItem('adminToken') || 'admin123';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
  }

  // 1. User Management
  users = {
    getAll: () => this.request('/users'),
    create: (data: any) => this.request('/users', { method: 'POST', body: JSON.stringify(data) }),
    performAction: (id: string, action: string) => this.request(`/users/${id}/action`, { method: 'POST', body: JSON.stringify({ action }) }),
    updateCoins: (id: string, amount: number, type: 'add' | 'deduct') => this.request(`/users/${id}/coins`, { method: 'POST', body: JSON.stringify({ amount, type }) })
  }

  // 2. Analytics
  analytics = {
    getLive: () => this.request('/analytics/live'),
    getGeo: () => this.request('/analytics/geo'),
    getBehavior: () => this.request('/analytics/behavior')
  }

  // 3. Content (CMS)
  content = {
    getCourses: () => this.request('/content/courses'),
    saveCourse: (data: any) => this.request('/content/courses', { method: 'POST', body: JSON.stringify(data) }),
    deleteCourse: (id: string) => this.request(`/content/courses/${id}`, { method: 'DELETE' }),
    getFiles: () => this.request('/content/files'),
    registerFile: (data: any) => this.request('/content/files', { method: 'POST', body: JSON.stringify(data) }),
    deleteFile: (id: string) => this.request(`/content/files/${id}`, { method: 'DELETE' }),
    getPopup: () => this.request('/content/popups'),
    updatePopup: (data: any) => this.request('/content/popups', { method: 'POST', body: JSON.stringify(data) })
  }

  // 4. Keys
  keys = {
    getAll: () => this.request('/keys'),
    generateBatch: (type: string, count: number) => this.request('/keys/generate', { method: 'POST', body: JSON.stringify({ type, count }) }),
    revoke: (id: string) => this.request(`/keys/${id}`, { method: 'DELETE' })
  }

  // 5. Settings
  settings = {
    get: () => this.request('/settings'),
    update: (data: any) => this.request('/settings', { method: 'POST', body: JSON.stringify(data) }),
    broadcast: (title: string, body: string, target: string = 'all') => this.request('/settings/notify', { method: 'POST', body: JSON.stringify({ title, body, target }) })
  }
}

export const adminApi = new AdminService();
