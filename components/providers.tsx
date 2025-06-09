"use client"

import { SessionProvider, SessionProviderProps } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

import { ModalProvider } from "@/components/context/modal-context"

// Combine props
interface ProvidersProps extends ThemeProviderProps {
  children: React.ReactNode
  session: SessionProviderProps["session"] // Add session prop
}

export function Providers({ children, session, ...props }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false} // Keep this based on our previous step
      {...props} // Pass any additional ThemeProvider props
    >
      {/* Pass session to SessionProvider */}
      <SessionProvider session={session}>
        <ModalProvider>{children}</ModalProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
