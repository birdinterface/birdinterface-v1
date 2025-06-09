"use client"

import { createContext, useContext, useState } from "react"

interface ModalContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  isSettingsModalOpen: boolean
  openSettingsModal: () => void
  closeSettingsModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const openSettingsModal = () => setIsSettingsModalOpen(true)
  const closeSettingsModal = () => setIsSettingsModalOpen(false)

  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        isSettingsModalOpen,
        openSettingsModal,
        closeSettingsModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}
