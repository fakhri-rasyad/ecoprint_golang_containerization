import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastProps {
  toast: ToastMessage
  onRemove: (id: number) => void
}

function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id])

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm text-sm font-medium ${styles[toast.type]}`}>
      <span className="text-base">{icons[toast.type]}</span>
      {toast.message}
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto opacity-50 hover:opacity-100 text-base leading-none"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: {
  toasts: ToastMessage[]
  onRemove: (id: number) => void
}) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 w-72">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}