import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
    updateEmail: (data: { email: string }) => api.put('/auth/email', data),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/auth/password', data),
    deleteAccount: () => api.delete('/auth/delete'),
    updateUsername: (data: { username: string }) => api.put('/auth/username', data),
  };

// Posts APIs
export const postsAPI = {
  create: (formData: FormData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: { category?: string; search?: string; page?: number }) =>
    api.get('/posts', { params }),
  getOne: (id: string) => api.get(`/posts/${id}`),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

// Comments APIs
export const commentsAPI = {
  create: (postId: string, data: { content: string }) =>
    api.post(`/comments/post/${postId}`, data),
  getAll: (postId: string) => api.get(`/comments/post/${postId}`),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Categories APIs
export const categoriesAPI = {
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post('/categories', data),
  getAll: () => api.get('/categories'),
  getOne: (slug: string) => api.get(`/categories/${slug}`),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export default api;
