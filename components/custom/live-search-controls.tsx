"use client"

import { AlertCircle, Calendar, Globe, Search, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useLiveSearch } from "@/hooks/use-live-search"
import { SearchParameters } from "@/lib/live-search"

interface LiveSearchControlsProps {
  onSearchChange?: (searchParameters: SearchParameters | null) => void
  disabled?: boolean
}

export function LiveSearchControls({
  onSearchChange,
  disabled = false,
}: LiveSearchControlsProps) {
  const {
    isSearchEnabled,
    searchParameters,
    searchErrors,
    toggleSearch,
    recentNews,
    specificSites,
    xHandles,
    byCountry,
    updateSearchParameters,
    hasErrors,
  } = useLiveSearch()

  const [quickSearchType, setQuickSearchType] = useState<string>("auto")
  const [customInput, setCustomInput] = useState<string>("")

  // Notify parent component when search parameters change
  useEffect(() => {
    onSearchChange?.(isSearchEnabled ? searchParameters : null)
  }, [isSearchEnabled, searchParameters, onSearchChange])

  const handleQuickSearch = (type: string) => {
    setQuickSearchType(type)

    switch (type) {
      case "news-7":
        recentNews(7)
        break
      case "news-1":
        recentNews(1)
        break
      case "sites":
        if (customInput) {
          const sites = customInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          specificSites(sites)
        }
        break
      case "x-handles":
        if (customInput) {
          const handles = customInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          xHandles(handles)
        }
        break
      case "country":
        if (customInput && customInput.length === 2) {
          byCountry(customInput.toUpperCase())
        }
        break
      default:
        updateSearchParameters({ mode: "auto" })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isSearchEnabled ? "default" : "outline"}
            size="sm"
            disabled={disabled}
            className="h-8"
          >
            <Search className="size-4 mr-1" />
            Live Search
            {isSearchEnabled && (
              <span className="ml-1 px-1 text-xs bg-secondary text-secondary-foreground rounded">
                ON
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="search-toggle" className="text-sm font-medium">
                Enable Live Search
              </Label>
              <button
                id="search-toggle"
                type="button"
                role="switch"
                aria-checked={isSearchEnabled}
                onClick={toggleSearch}
                disabled={disabled}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${isSearchEnabled ? "bg-primary" : "bg-gray-200"}
                `}
              >
                <span
                  className={`
                    inline-block size-4 rounded-full bg-white transition-transform
                    ${isSearchEnabled ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </button>
            </div>

            {hasErrors && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="size-4 text-red-500" />
                <div className="text-sm text-red-700">
                  {searchErrors.join(", ")}
                </div>
              </div>
            )}

            {isSearchEnabled && (
              <>
                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Setup</Label>

                  <Select
                    value={quickSearchType}
                    onValueChange={setQuickSearchType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Search className="size-4" />
                          Auto (Smart Detection)
                        </div>
                      </SelectItem>
                      <SelectItem value="news-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          Recent News (24h)
                        </div>
                      </SelectItem>
                      <SelectItem value="news-7">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          Recent News (7 days)
                        </div>
                      </SelectItem>
                      <SelectItem value="sites">
                        <div className="flex items-center gap-2">
                          <Globe className="size-4" />
                          Specific Websites
                        </div>
                      </SelectItem>
                      <SelectItem value="x-handles">
                        <div className="flex items-center gap-2">
                          <Users className="size-4" />X Handles
                        </div>
                      </SelectItem>
                      <SelectItem value="country">
                        <div className="flex items-center gap-2">
                          <Globe className="size-4" />
                          By Country
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {(quickSearchType === "sites" ||
                    quickSearchType === "x-handles" ||
                    quickSearchType === "country") && (
                    <div className="space-y-2">
                      <Input
                        placeholder={
                          quickSearchType === "sites"
                            ? "example.com, news.site.com"
                            : quickSearchType === "x-handles"
                              ? "handle1, handle2"
                              : "US, GB, DE"
                        }
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        {quickSearchType === "sites" &&
                          "Enter website domains separated by commas (max 5)"}
                        {quickSearchType === "x-handles" &&
                          "Enter X handles separated by commas"}
                        {quickSearchType === "country" &&
                          "Enter 2-letter country code (e.g., US, GB, DE)"}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleQuickSearch(quickSearchType)}
                    size="sm"
                    className="w-full"
                    disabled={
                      ((quickSearchType === "sites" ||
                        quickSearchType === "x-handles") &&
                        !customInput) ||
                      (quickSearchType === "country" &&
                        (!customInput || customInput.length !== 2))
                    }
                  >
                    Apply Search Settings
                  </Button>
                </div>

                {searchParameters && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Current Settings
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 border rounded text-gray-700">
                          Mode: {searchParameters.mode}
                        </span>
                        {searchParameters.return_citations && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 border rounded text-gray-700">
                            Citations
                          </span>
                        )}
                        {searchParameters.max_search_results && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 border rounded text-gray-700">
                            Max: {searchParameters.max_search_results}
                          </span>
                        )}
                        {searchParameters.sources &&
                          searchParameters.sources.length > 0 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 border rounded text-gray-700">
                              Sources:{" "}
                              {searchParameters.sources
                                .map((s) => s.type)
                                .join(", ")}
                            </span>
                          )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
