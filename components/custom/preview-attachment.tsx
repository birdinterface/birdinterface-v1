"use client"

import { Attachment } from "ai"
import { X } from "lucide-react"
import { useState } from "react"

import { LoaderIcon } from "./icons"
import { Button } from "../ui/button"

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment
  isUploading?: boolean
  onRemove?: () => void
}) => {
  const { name, url, contentType } = attachment
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const isImage = contentType?.startsWith("image")

  const handleImageClick = () => {
    if (isImage && !isUploading) {
      setIsModalOpen(true)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      handleModalClose()
    }
  }

  return (
    <div className="relative group/attachment">
      <div className="flex flex-col gap-2 max-w-16">
        <div
          className={`size-12 bg-muted rounded-lg relative flex flex-col items-center justify-center ${
            isImage && !isUploading ? "cursor-pointer" : ""
          }`}
          onClick={handleImageClick}
          onMouseEnter={() => isImage && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {contentType ? (
            contentType.startsWith("image") ? (
              // NOTE: it is recommended to use next/image for images
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={name ?? "An image attachment"}
                className="rounded-lg size-full object-cover"
              />
            ) : (
              <div className=""></div>
            )
          ) : (
            <div className=""></div>
          )}

          {isUploading && (
            <div className="animate-spin absolute text-zinc-500">
              <LoaderIcon />
            </div>
          )}

          {/* Custom tooltip for image names - below image with full opacity background, no border */}
          {isImage && showTooltip && name && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 px-2 py-1 mt-1 bg-background rounded text-xs task-calendar-date text-foreground whitespace-nowrap pointer-events-none shadow-md">
              {name}
            </div>
          )}
        </div>

        {/* Only show filename for non-image files */}
        {!isImage && (
          <div className="intelligence-content text-zinc-500 max-w-16 truncate">
            {name}
          </div>
        )}
      </div>

      {/* Larger Image Modal with better mobile support */}
      {isImage && isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
          onTouchEnd={handleBackdropClick}
        >
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
          />

          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-12 right-4 z-20 bg-background/80 backdrop-blur-sm hover:bg-background/90 dark:bg-transparent dark:backdrop-blur-none dark:hover:bg-transparent md:opacity-0 md:hover:opacity-100 transition-opacity"
            onClick={handleModalClose}
          >
            <X className="size-5" />
          </Button>

          <div className="relative z-10 w-full max-w-6xl h-[700px] mx-auto p-6">
            <div className="size-full flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={name ?? "Full size image"}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {onRemove && (
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onRemove()}
            className="p-1 rounded-full bg-background/80 text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}
