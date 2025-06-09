# External Project Access

## AdvancersAI Nova Project

**Project Path:** `C:\Projects\advancersai-nova`

**Target Directory:** `app\(chat)`

This file serves as a reference for accessing code from the AdvancersAI Nova project, specifically the chat functionality located in the `app\(chat)` directory.

### Directory Structure

```
app\(chat)\
├── actions.ts
├── layout.tsx
├── page.tsx
├── opengraph-image.png
├── twitter-image.png
├── api\
│   ├── chat\
│   │   └── route.ts
│   ├── files\
│   │   └── upload\
│   │       └── route.ts
│   └── history\
│       └── route.ts
└── chat\
    └── [id]\
        └── page.tsx
```

### Available Files

- **Main Components:**
  - `actions.ts` - Chat actions and functionality
  - `layout.tsx` - Chat layout component
  - `page.tsx` - Main chat page
- **API Routes:**
  - `api/chat/route.ts` - Main chat API endpoint
  - `api/files/upload/route.ts` - File upload functionality
  - `api/history/route.ts` - Chat history management
- **Dynamic Routes:**
  - `chat/[id]/page.tsx` - Individual chat page

### Usage Notes

- Use this path when searching or referencing code from the external project
- The chat functionality is located in the `(chat)` route group
- This is a separate project from the current birdinterface-v1 workspace

### Access Commands

To access files from this project, use the absolute path:
`C:\Projects\advancersai-nova\app\(chat)\`
