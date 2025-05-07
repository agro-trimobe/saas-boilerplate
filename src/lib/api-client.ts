import axios from 'axios';

// Interceptor para tratar erros de autenticação
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Adicionar interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (não autorizado), redirecionar para a página de login
    if (error.response && error.response.status === 401) {
      console.error('Erro de autenticação detectado:', error.response.data);
      
      // Em ambiente de navegador, redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export { api };

export const apiClient = {
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post('/auth/login', credentials).then(res => res.data),
    register: (userData: any) => 
      api.post('/auth/register', userData).then(res => res.data),
    confirmRegistration: (confirmData: { email: string; code: string }) => 
      api.post('/auth/confirm', confirmData).then(res => res.data),
    forgotPassword: (email: string) => 
      api.post('/auth/forgot-password', { email }).then(res => res.data),
    resetPassword: (resetData: { email: string; code: string; newPassword: string }) => 
      api.post('/auth/reset-password', resetData).then(res => res.data),
  }
};
