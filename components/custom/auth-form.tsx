import Form from "next/form"
import { useState } from "react"

import { SignInWithGoogle } from "./sign-in-with-google"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  showNameField = false,
}: {
  action: any
  children: React.ReactNode
  defaultEmail?: string
  showNameField?: boolean
}) {
  const [showEmailForm, setShowEmailForm] = useState(false)

  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <SignInWithGoogle />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowEmailForm(!showEmailForm)}
      >
        Continue with Email
      </Button>

      {showEmailForm && (
        <div className="flex flex-col gap-4 mt-4">
          {showNameField && (
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="name"
                className="text-zinc-600 font-normal dark:text-zinc-400"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                className="bg-muted text-md md:text-sm"
                type="text"
                placeholder=""
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              className="bg-muted text-md md:text-sm"
              type="email"
              placeholder=""
              autoComplete="email"
              required
              defaultValue={defaultEmail}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="password"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              className="bg-muted text-md md:text-sm"
              type="password"
              required
            />
          </div>

          {children}
        </div>
      )}
    </Form>
  )
}
