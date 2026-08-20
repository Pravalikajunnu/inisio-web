/**
 * Inisio Client-Side API Helper for Communication with Express + MongoDB Backend
 */

const getAuthToken = (): string | null => {
  try {
    const saved = localStorage.getItem('inisio_active_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = (import.meta as any).env?.VITE_API_URL 
    ? (import.meta as any).env.VITE_API_URL.replace(/\/$/, '')
    : (import.meta as any).env?.VITE_BACKEND_URL 
      ? `${(import.meta as any).env.VITE_BACKEND_URL.replace(/\/$/, '')}/api`
      : '/api';

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password?: string }) =>
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { name: string; email: string; password?: string; role?: string; company?: string; phone?: string }) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    forgotPassword: (email: string) =>
      request<any>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email: string, otp: string) =>
      request<any>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),
    resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
      request<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    sendVerification: (email: string) =>
      request<any>('/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    getMe: () => request<any>('/auth/me'),
    updateProfile: (profileData: any) =>
      request<any>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Leads
  leads: {
    getAll: (params?: { search?: string; filterSource?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.filterSource) query.append('filterSource', params.filterSource);
      const qs = query.toString();
      return request<any[]>(`/leads${qs ? `?${qs}` : ''}`);
    },
    create: (leadData: any) =>
      request<any>('/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      }),
    update: (id: string, updates: any) =>
      request<any>(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<any>(`/leads/${id}`, {
        method: 'DELETE',
      }),
    clearAll: () =>
      request<any>('/leads/clear-all', {
        method: 'DELETE',
      }),
  },

  // Consultations
  consultations: {
    create: (data: any) =>
      request<any>('/consultations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: () => request<any[]>('/consultations'),
    updateStatus: (id: string, status: string, feedback?: string) =>
      request<any>(`/consultations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, feedback }),
      }),
  },

  // Assessments & Underwriting
  assessments: {
    evaluate: (data: any) =>
      request<any>('/assessments/evaluate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    quickCalc: (data: any) =>
      request<any>('/assessments/quick-calc', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyAssessments: () => request<any[]>('/assessments/my-assessments'),
    getAll: () => request<any[]>('/assessments/all'),
  },

  // Projects & CA Audits
  projects: {
    getAll: (params?: any) => {
      const query = new URLSearchParams(params || {}).toString();
      return request<any[]>(`/projects${query ? `?${query}` : ''}`);
    },
    create: (projectData: any) =>
      request<any>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),
    updateAudit: (id: string, auditData: { status: string; caReviewNotes?: string; assignedCA?: string }) =>
      request<any>(`/projects/${id}/audit`, {
        method: 'PUT',
        body: JSON.stringify(auditData),
      }),
    delete: (id: string) =>
      request<any>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  // Contact Inquiries
  contact: {
    sendMessage: (data: { fullName: string; email: string; phone: string; message: string; subject?: string }) =>
      request<any>('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMessages: () => request<any[]>('/contact'),
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(`/contact/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      }),
  },

  // Industries & Services
  industries: {
    getAll: () => request<any[]>('/industries'),
    getBySlug: (slug: string) => request<any>(`/industries/${slug}`),
  },
  services: {
    getAll: () => request<any[]>('/services'),
    getBySlug: (slug: string) => request<any>(`/services/${slug}`),
  },
};

export default api;
