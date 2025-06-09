"use client"

import {
  Clock,
  Download,
  LucideIcon,
  Mic,
  Shield,
  User as UserIcon,
} from "lucide-react"
import Image from "next/image"
import { type User } from "next-auth"
import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, fetcher } from "@/lib/utils"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
}

type SettingCategory =
  | "Account"
  | "AI Settings"
  | "Security"
  | "Session"
  | "Data"

const settingsCategories: {
  key: SettingCategory
  label: string
  icon: LucideIcon
}[] = [
  { key: "Account", label: "Account", icon: UserIcon },
  { key: "AI Settings", label: "AI Settings", icon: Mic },
  { key: "Security", label: "Security", icon: Shield },
  { key: "Session", label: "Session", icon: Clock },
  { key: "Data", label: "Data", icon: Download },
]

export function SettingsModal({
  open,
  onOpenChange,
  user,
}: SettingsModalProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<SettingCategory>("Account")
  const [hoveredCategory, setHoveredCategory] =
    useState<SettingCategory | null>(null)

  const {
    data: userPreferences,
    isLoading,
    mutate,
  } = useSWR(user ? "/api/user-preferences" : null, fetcher, {
    fallbackData: {},
  })

  useEffect(() => {
    if (open) {
      mutate()
    }
  }, [open, mutate])

  // Handle category selection
  const handleCategoryHover = useCallback(
    (category: SettingCategory) => {
      if (hoveredCategory === category) return
      setHoveredCategory(category)
      setSelectedCategory(category)
    },
    [hoveredCategory]
  )

  const renderCategoryItem = (category: {
    key: SettingCategory
    label: string
    icon: LucideIcon
  }) => {
    const Icon = category.icon

    return (
      <div
        key={category.key}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-md transition-all duration-200 cursor-pointer hover:bg-task-hover",
          selectedCategory === category.key && "bg-task-hover"
        )}
        onMouseEnter={() => handleCategoryHover(category.key)}
        onClick={() => setSelectedCategory(category.key)}
      >
        <Icon size={16} className="text-muted-foreground" />
        <span
          className={cn(
            "flex-1 min-w-0 text-muted-foreground group-hover:text-muted-foreground font-chat text-[11px] tracking-wider",
            selectedCategory === category.key &&
              "text-foreground group-hover:text-foreground"
          )}
        >
          {category.label}
        </span>
      </div>
    )
  }

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="fullName"
            className="text-xs font-medium text-muted-foreground"
          >
            Full Name
          </Label>
          <Input
            id="fullName"
            defaultValue={user?.name || ""}
            className="mt-1 text-sm border-0 bg-task-light dark:bg-task-dark"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <Label
            htmlFor="email"
            className="text-xs font-medium text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            defaultValue={user?.email || ""}
            className="mt-1 text-sm border-0 bg-task-light dark:bg-task-dark"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Profile Image
          </Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="size-12 rounded-full"
                />
              ) : (
                <UserIcon size={20} className="text-muted-foreground" />
              )}
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Change Image
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Label className="text-xs font-medium text-muted-foreground">
            Account Information
          </Label>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <div>
              Account created: {user?.email ? "January 2024" : "Not available"}
            </div>
            <div>Sign-in methods: Google, Email</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAISettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            AI Voice
          </Label>
          <div className="mt-2 space-y-2">
            {["Default", "Professional", "Casual", "Technical"].map((voice) => (
              <div key={voice} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={voice}
                  name="aiVoice"
                  defaultChecked={voice === "Default"}
                  className="size-3"
                />
                <Label htmlFor={voice} className="text-sm cursor-pointer">
                  {voice}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Password
          </Label>
          <div className="mt-2 space-y-2">
            <Button variant="outline" size="sm" className="text-xs">
              Set Password
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Change Password
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Label className="text-xs font-medium text-muted-foreground">
            Multi-factor Authentication
          </Label>
          <div className="mt-2">
            <Button variant="outline" size="sm" className="text-xs">
              Enable MFA
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSessionSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Current Session
          </Label>
          <div className="mt-2 p-3 border rounded-md text-sm">
            <div className="text-muted-foreground">
              This device • Active now
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Active Sessions
          </Label>
          <div className="mt-2 space-y-2">
            <div className="p-3 border rounded-md text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-foreground">MacBook Pro</div>
                  <div className="text-muted-foreground text-xs">
                    Last active 2 hours ago
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="destructive" size="sm" className="text-xs">
            Sign Out All Devices
          </Button>
        </div>
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Data Export
          </Label>
          <div className="mt-2">
            <Button variant="outline" size="sm" className="text-xs">
              Download All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Get a copy of all your data in JSON format
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Label className="text-xs font-medium text-destructive">
            Danger Zone
          </Label>
          <div className="mt-2">
            <Button variant="destructive" size="sm" className="text-xs">
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently delete your account and all associated data
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsContent = () => {
    switch (selectedCategory) {
      case "Account":
        return renderAccountSettings()
      case "AI Settings":
        return renderAISettings()
      case "Security":
        return renderSecuritySettings()
      case "Session":
        return renderSessionSettings()
      case "Data":
        return renderDataSettings()
      default:
        return renderAccountSettings()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-6 p-6 mx-4 md:mx-auto bg-normal-task rounded-lg">
        <div className="flex flex-col h-[500px]">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-foreground">Settings</h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700/50 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600">
            <div className="space-y-1">
              {settingsCategories.map(renderCategoryItem)}
            </div>
          </div>
        </div>

        <div
          className="hidden md:block bg-border h-[500px]"
          style={{ zIndex: -1 }}
        ></div>

        <div className="hidden md:block h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700/50 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600">
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-4">
              {selectedCategory}
            </h3>
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
