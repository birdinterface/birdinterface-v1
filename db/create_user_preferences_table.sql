-- Create UserPreferences table
CREATE TABLE IF NOT EXISTS "UserPreferences" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "tabNames" JSONB NOT NULL DEFAULT '{"todo": "ToDo", "watch": "Watch", "later": "Later", "done": "Completed"}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId")
);

-- Create an index on userId for faster queries
CREATE INDEX IF NOT EXISTS "UserPreferences_userId_idx" ON "UserPreferences"("userId"); 