'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/app/(auth)/auth'
import { getUserPreferences, saveUserPreferences } from '@/lib/queries'

export async function saveModel(modelName: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const userId = session.user.id
  let preferences = await getUserPreferences(userId)

  if (!preferences) {
    // If no preferences exist, we can't create them here
    // because we don't have all the required fields (like tabNames).
    // This action should only be responsible for updating the model.
    // The user preferences should be created on first login or somewhere else.
    // For now, we will just log an error.
    console.error(`User preferences not found for user ${userId}. Cannot save model.`)
    // Or we could create a default one, but that might be unexpected.
    // For now, let's assume preferences exist for any logged-in user.
    // To be safe, let's handle the case where they don't exist yet.
    // We'll create a new preference object.
    const newPreferences = {
        selectedModel: modelName,
        // we have to provide default tab names.
        tabNames: {
            todo: 'ToDo',
            watch: 'Watch',
            later: 'Later',
            done: 'Completed'
        }
    }
    await saveUserPreferences(userId, newPreferences)

  } else {
    await saveUserPreferences(userId, { selectedModel: modelName })
  }

  revalidatePath('/')
  revalidatePath('/chat')
  revalidatePath('/intelligence')

  return { success: true }
} 