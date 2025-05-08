'use client';

import { create } from 'zustand';
import { StateCreator } from 'zustand';

/**
 * Tipos de notificações do sistema
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interface para uma notificação do sistema
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

/**
 * Interface para o estado de notificações global
 */
interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

/**
 * Store global para gerenciamento de notificações do sistema
 * Centraliza a gestão de mensagens e avisos, evitando o uso de múltiplos estados locais
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  /**
   * Adiciona uma nova notificação ao sistema
   * @param notification Dados da notificação a ser exibida
   * @returns ID único da notificação criada
   */
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newNotification: Notification = {
      id,
      autoClose: true,
      duration: 5000, // 5 segundos por padrão
      ...notification,
    };
    
    set((state: NotificationState) => ({ 
      notifications: [...state.notifications, newNotification] 
    }));
    
    // Se a notificação for configurada para fechar automaticamente
    if (newNotification.autoClose) {
      setTimeout(() => {
        set((state: NotificationState) => ({
          notifications: state.notifications.filter(
            (item: Notification) => item.id !== id
          ),
        }));
      }, newNotification.duration);
    }
    
    return id;
  },
  
  /**
   * Remove uma notificação específica pelo ID
   */
  removeNotification: (id: string) => {
    set((state: NotificationState) => ({
      notifications: state.notifications.filter((notification: Notification) => notification.id !== id),
    }));
  },
  
  /**
   * Remove todas as notificações ativas
   */
  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));

/**
 * Hook auxiliar para usar notificações de forma mais simples em componentes
 * Fornece métodos específicos para cada tipo de notificação
 */
export function useNotifications() {
  const store = useNotificationStore();
  
  const showSuccess = (title: string, message: string, options = {}) => {
    return store.addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  };
  
  const showError = (title: string, message: string, options = {}) => {
    return store.addNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  };
  
  const showWarning = (title: string, message: string, options = {}) => {
    return store.addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };
  
  const showInfo = (title: string, message: string, options = {}) => {
    return store.addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  };
  
  return {
    notifications: store.notifications,
    remove: store.removeNotification,
    clearAll: store.clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
