// Simplified version of the toast hook
"use client"

type ToastProps = {
  title: string
  description?: string
  duration?: number
}

export function toast({ title, description, duration = 3000 }: ToastProps) {
  // In a real implementation, this would manage a queue of toasts
  // For simplicity, we'll just create an alert
  alert(`${title}\n${description || ""}`)
}

