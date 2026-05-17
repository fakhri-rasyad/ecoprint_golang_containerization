import { create } from 'zustand'
import type { ToastMessage, ToastType } from '../components/ui/Toast'

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: number) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type) => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))