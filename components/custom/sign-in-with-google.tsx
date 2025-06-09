"use client"

import { signIn } from "next-auth/react"

import { LogoGoogle } from "./icons"
import { Button } from "../ui/button"

export function SignInWithGoogle() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      <LogoGoogle size={16} className="mr-2" />
      Continue with Google
    </Button>
  )
}
