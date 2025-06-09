import { createClient } from "@supabase/supabase-js"
// @ts-ignore: If types are missing, this will be resolved after install

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export type User = {
  id: string
  name: string
  email: string
  password: string | null
  membership: string
  stripecustomerid: string | null
  stripesubscriptionid: string | null
  previoussubscriptionid: string | null
  usage: string
  provider: string
}

export type Chat = {
  id: string
  createdat: string
  updatedat: string
  messages: any[]
  userid: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  status: string
  completed: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
  userId: string
  link: string | null
}

export type RecurringTaskSupabase = {
  id: string
  title: string
  description: string | null
  duedate: string | null // Supabase uses lowercase
  status: string
  completed: boolean
  completedat: string | null // Supabase uses lowercase
  createdat: string // Supabase uses lowercase
  updatedat: string // Supabase uses lowercase
  userid: string // Supabase uses lowercase
  recurrencepattern: string | null // Supabase uses lowercase
}

export type ActionLog = {
  id: string
  taskId: string
  userId: string
  actorType: string
  actorId: string
  actionType: string
  details: any
  timestamp: string
}

export type ActionLogSupabase = {
  id: string
  taskid: string
  userid: string
  actortype: string
  actorid: string
  actiontype: string
  details: any
  timestamp: string
}

export type UserPreferences = {
  id: string
  userId: string
  tabNames: {
    todo: string
    watch: string
    later: string
    done: string
  }
  selectedModel?: string
  createdAt: string
  updatedAt: string
}
