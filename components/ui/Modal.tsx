// Modal.tsx

"use client"

import { X } from "lucide-react"
import React from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center ${className}`}
      style={{ width: "100vw", height: "100vh" }}
    >
      <div className="fixed inset-0 bg-black dark:bg-black opacity-80 pointer-events-auto"></div>
      <div className="w-full h-full bg-white dark:bg-black p-6 relative pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-white">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
