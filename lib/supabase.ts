import { createClient } from '@supabase/supabase-js'
// @ts-ignore: If types are missing, this will be resolved after install

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
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
  createdAt: string
  updatedAt: string
  messages: any[]
  userId: string
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

export type UserPreferences = {
  id: string
  userId: string
  tabNames: {
    todo: string
    watch: string
    later: string
    done: string
  }
  createdAt: string
  updatedAt: string
} 