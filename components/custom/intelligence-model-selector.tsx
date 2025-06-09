"use client"

import Image from "next/image"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { models } from "@/lib/model"
import { cn } from "@/lib/utils"

const modelDisplayConfig: { [key: string]: { color: string } } = {
  "grok-3": {
    color: "hue-rotate-[40deg] saturate-60 brightness-150", // Was Dark Purple
  },
  "gemini-2.5-pro": {
    color: "saturate-60 brightness-150", // Was blue
  },
  "claude-opus-4": {
    color: "hue-rotate-[-210deg] saturate-60 brightness-150", // Was Dark Orange
  },
  "chatgpt-4o": {
    color: "hue-rotate-[-120deg] saturate-60 brightness-150", // Was Dark Green
  },
}

const getModelColorClass = (modelName?: string): string => {
  if (!modelName) return ""
  const key = Object.keys(modelDisplayConfig).find((k) =>
    modelName.startsWith(k)
  )
  return key ? modelDisplayConfig[key]?.color || "" : ""
}

export function IntelligenceModelSelector({
  selectedModelName,
}: {
  selectedModelName: string
}) {
  const [open, setOpen] = useState(false)
  const [internalSelectedModelName, setInternalSelectedModelName] =
    useState(selectedModelName)

  const selectedModel = models.find(
    (model) => model.name === internalSelectedModelName
  )
  const displayName = selectedModel?.label || internalSelectedModelName

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 text-muted-foreground hover:bg-task-hover text-xs font-medium normal-case transition-colors rounded-md focus-visible:ring-0 focus-visible:ring-offset-0">
          <div className="relative size-4">
            <Image
              src="/images/AI-Star-2.png"
              alt="AI Model"
              fill
              sizes="16px"
              className={cn(
                "object-contain blur-[2px]",
                getModelColorClass(selectedModel?.name)
              )}
              draggable={false}
            />
          </div>
          <span>{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-48 border border-border rounded-lg"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.name}
            className="flex items-center gap-3 text-[10px] cursor-pointer hover:bg-task-hover focus:bg-task-hover data-[highlighted]:bg-task-hover"
            onSelect={(e) => {
              e.preventDefault()
              setInternalSelectedModelName(model.name)
              setOpen(false)
            }}
          >
            <div className="relative size-4">
              <Image
                src="/images/AI-Star-2.png"
                alt={model.label}
                fill
                sizes="16px"
                className={cn(
                  "object-contain blur-[2px]",
                  getModelColorClass(model.name)
                )}
                draggable={false}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-medium">{model.label}</span>
              <span className="text-muted-foreground text-[9px]">
                {model.name}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
