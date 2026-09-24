/**
 * Inisio Client-Side API Helper for Communication with Express + MongoDB Backend
 */

export const getAuthToken = (): string | null => {
  try {
    const directToken = localStorage.getItem('inisio_auth_token');
    if (directToken) return directToken;

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

export const getApiBaseUrl = (): string => {
  const env = (import.meta as any).env || {};
  const configuredUrl = env.VITE_API_URL || env.VITE_BACKEND_URL;
  if (!configuredUrl) return '/api';

  const baseUrl = configuredUrl.replace(/\/$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export const resolveApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) return endpoint;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}${cleanEndpoint}`;
};

export async function fetchAuthenticatedBlob(endpoint: string): Promise<Blob> {
  const token = getAuthToken();
  const response = await fetch(resolveApiUrl(endpoint), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || `Unable to retrieve document (${response.status})`);
  }

  return response.blob();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const isMultipart = options.body instanceof FormData;
  const headers: Record<string, string> = isMultipart
    ? { ...(options.headers as Record<string, string> || {}) }
    : { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = resolveApiUrl(endpoint);

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
  // Auth & Email Verification
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
    verifyEmail: (email: string, otp: string) =>
      request<any>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
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
    resendVerification: (email: string) =>
      request<any>('/auth/resend-verification', {
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

  // Users & Roles Management
  users: {
    getAll: () => request<any[]>('/users'),
    getById: (id: string) => request<any>(`/users/${id}`),
    updateRole: (id: string, role: string) =>
      request<any>(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<any>(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  // Leads
  leads: {
    getAll: (params?: { search?: string; filterSource?: string; email?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.filterSource) query.append('filterSource', params.filterSource);
      if (params?.email) query.append('email', params.email);
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
    assign: (id: string, assignment: { dprAssignedTo?: string; consultationAssignedTo?: string }) =>
      request<any>(`/leads/${id}/assignment`, {
        method: 'PUT',
        body: JSON.stringify(assignment),
      }),
    updateProgress: (id: string, progress: Record<string, boolean>) =>
      request<any>(`/leads/${id}/progress`, {
        method: 'PUT',
        body: JSON.stringify(progress),
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

  // Notifications
  notifications: {
    getAll: () => request<any[]>('/notifications'),
    create: (data: any) =>
      request<any>('/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    markAsRead: (id: string) =>
      request<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllAsRead: () =>
      request<any>('/notifications/read-all', {
        method: 'PATCH',
      }),
    clearAll: () =>
      request<any>('/notifications/clear-all', {
        method: 'DELETE',
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

  // Contact Enquiries
  contact: {
    sendMessage: (data: {
      name?: string;
      fullName?: string;
      email: string;
      phone: string;
      company?: string;
      subject?: string;
      message: string;
    }) =>
      request<any>('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getEnquiries: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
      const qStr = query.toString();
      return request<any>(`/contact${qStr ? `?${qStr}` : ''}`);
    },
    getMessages: () => request<any>('/contact'),
    getEnquiryDetails: (id: string) => request<any>(`/contact/${id}`),
    updateEnquiry: (
      id: string,
      updates: { status?: string; notes?: string; assignedTo?: string; isArchived?: boolean }
    ) =>
      request<any>(`/contact/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(`/contact/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      }),
    deleteEnquiry: (id: string, permanent: boolean = false) =>
      request<any>(`/contact/${id}${permanent ? '?permanent=true' : ''}`, {
        method: 'DELETE',
      }),
  },

  documents: {
    listForProject: (leadId: string) => request<any[]>(`/documents/project/${leadId}`),
    upload: (leadId: string, category: string, file: File) => {
      const formData = new FormData();
      formData.append('leadId', leadId);
      formData.append('category', category);
      formData.append('file', file);
      return request<any>('/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
    downloadUrl: (id: string) => resolveApiUrl(`/documents/${id}/download`),
    downloadBlob: (id: string) => fetchAuthenticatedBlob(`/documents/${id}/download`),
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

export const apiClient = api;
export default api;
