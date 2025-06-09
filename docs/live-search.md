# Live Search Feature

This document describes the Live Search functionality integrated into the application using xAI's Grok API.

## Overview

Live Search allows the AI to access real-time information from the web, X (Twitter), news sources, and RSS feeds to provide up-to-date responses. The feature is currently free during the beta period until June 5, 2025.

## New Features

### Auto-Navigation to Chat URLs

When a user starts a new conversation from `/intelligence`, the URL automatically updates to `/intelligence/chat/{id}` after the first AI response is received. This ensures:

- Users can bookmark specific conversations
- The back button works intuitively
- Direct links to conversations work properly
- Chat history is properly tracked

The navigation only occurs for:

- New chats (not existing conversations)
- Non-incognito mode (since incognito chats aren't saved)
- After receiving the first AI response (confirming the chat was saved)

## Implementation

### API Integration

Live Search is integrated into both chat endpoints:

- `/app/chat/api/chat/route.ts` - Main chat interface
- `/app/intelligence/api/chat/route.ts` - Intelligence interface

### Auto-Detection

The system automatically enables Live Search when it detects certain keywords in user queries:

- Time-sensitive queries: "news", "latest", "recent", "current", "today", etc.
- Current data queries: "stock price", "weather", "events", "live", "real-time"
- Market/financial data: "price of", "stock", "crypto", "bitcoin", "market"
- Social media trends: "trending", "viral", "popular", "buzz"
- Location-specific: "near me", "local", "in my area"

### Files Added/Modified

1. **`lib/live-search.ts`** - Core types and utilities
2. **`hooks/use-live-search.ts`** - React hook for Live Search functionality
3. **`components/custom/live-search-controls.tsx`** - UI component for search controls
4. **`app/intelligence/api/chat/route.ts`** - Updated to support Live Search
5. **`app/chat/api/chat/route.ts`** - Updated to support Live Search

## Usage

### Programmatic Usage

```typescript
import { createSearchParameters } from "@/lib/live-search"

// Auto-search with smart detection
const autoSearch = createSearchParameters.auto()

// Search recent news
const newsSearch = createSearchParameters.recentNews(7) // Last 7 days

// Search specific websites
const siteSearch = createSearchParameters.specificSites([
  "example.com",
  "news.site.com",
])

// Search X handles
const xSearch = createSearchParameters.xHandles(["handle1", "handle2"])

// Search by country
const countrySearch = createSearchParameters.byCountry("US")
```

### React Hook Usage

```typescript
import { useLiveSearch } from "@/hooks/use-live-search"

function ChatComponent() {
  const {
    isSearchEnabled,
    searchParameters,
    toggleSearch,
    recentNews,
    specificSites,
  } = useLiveSearch()

  // Enable search for recent news
  const handleNewsSearch = () => recentNews(7)

  // Toggle search on/off
  const handleToggle = () => toggleSearch()
}
```

### UI Component Usage

```typescript
import { LiveSearchControls } from '@/components/custom/live-search-controls';

function ChatInterface() {
  const [searchParams, setSearchParams] = useState(null);

  return (
    <div>
      <LiveSearchControls
        onSearchChange={setSearchParams}
        disabled={false}
      />
      {/* Chat interface */}
    </div>
  );
}
```

## Search Parameters

### Basic Parameters

- **mode**: `"auto"` | `"on"` | `"off"`

  - `"auto"`: AI decides when to search
  - `"on"`: Always search
  - `"off"`: Never search

- **return_citations**: `boolean` (default: true)

  - Whether to include source citations in responses

- **max_search_results**: `number` (default: 20, max: 50)
  - Maximum number of search results to consider

### Date Range Parameters

- **from_date**: `string` (ISO8601 format: YYYY-MM-DD)
- **to_date**: `string` (ISO8601 format: YYYY-MM-DD)

### Data Sources

#### Web Search

```typescript
{
  type: 'web',
  country?: string,           // ISO alpha-2 code (US, GB, etc.)
  excluded_websites?: string[], // Max 5 websites
  allowed_websites?: string[],  // Max 5 websites (cannot use with excluded)
  safe_search?: boolean       // Default: true
}
```

#### X (Twitter) Search

```typescript
{
  type: 'x',
  x_handles?: string[]        // X handles to search
}
```

#### News Search

```typescript
{
  type: 'news',
  country?: string,           // ISO alpha-2 code
  excluded_websites?: string[], // Max 5 websites
  safe_search?: boolean       // Default: true
}
```

#### RSS Search

```typescript
{
  type: 'rss',
  links?: string[]            // RSS feed URLs (currently max 1)
}
```

## Examples

### Search Recent News

```typescript
const newsParams = {
  mode: "auto",
  return_citations: true,
  from_date: "2024-01-01",
  to_date: "2024-01-07",
  sources: [{ type: "news" }, { type: "web" }],
}
```

### Search Specific Websites

```typescript
const siteParams = {
  mode: "on",
  return_citations: true,
  sources: [
    {
      type: "web",
      allowed_websites: ["github.com", "stackoverflow.com"],
    },
  ],
}
```

### Search X Handles

```typescript
const xParams = {
  mode: "auto",
  return_citations: true,
  sources: [
    {
      type: "x",
      x_handles: ["elonmusk", "openai"],
    },
  ],
}
```

### Country-Specific Search

```typescript
const countryParams = {
  mode: "auto",
  return_citations: true,
  sources: [
    { type: "web", country: "GB" },
    { type: "news", country: "GB" },
  ],
}
```

## API Request Format

When sending a request to the chat API, include the `searchParameters` field:

```javascript
const response = await fetch("/api/intelligence/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: chatId,
    messages: messages,
    isIncognito: false,
    searchParameters: {
      mode: "auto",
      return_citations: true,
      max_search_results: 10,
    },
  }),
})
```

## Environment Variables

Ensure `XAI_API_KEY` is set in your environment variables:

```bash
XAI_API_KEY=your_xai_api_key_here
```

## Limitations

- RSS sources currently support only 1 feed URL
- Maximum 5 websites for allowed/excluded lists
- Maximum 50 search results
- Beta feature (free until June 5, 2025)
- You will still be charged for inference tokens

## Best Practices

1. **Use Auto Mode**: Let the AI decide when to search for optimal performance
2. **Enable Citations**: Always include citations for transparency
3. **Limit Results**: Use appropriate `max_search_results` to control costs
4. **Validate Parameters**: Use the validation functions before sending requests
5. **Handle Errors**: Always check for and handle search parameter validation errors

## Future Enhancements

- Support for multiple RSS feeds
- Advanced filtering options
- Search result caching
- Custom search sources
- Integration with more data providers
