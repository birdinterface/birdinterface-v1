import { auth } from "@/app/(auth)/auth"
import { getChatById, saveChat } from "@/lib/queries"

export async function POST(request: Request) {
  const { id } = await request.json()

  if (!id) {
    return Response.json({ error: "Chat ID is required" }, { status: 400 })
  }

  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let chatExists = false
    try {
      await getChatById({ id })
      chatExists = true
    } catch (e) {
      chatExists = false
    }

    if (chatExists) {
      // Chat already exists; nothing to do
      return Response.json({ success: true, id })
    }

    // Create an empty chat record so that the UI can safely navigate to it
    await saveChat({ id, messages: [], userId: session.user.id })

    return Response.json({ success: true, id })
  } catch (error) {
    console.error("Failed to initialize chat", error)
    return Response.json(
      { error: "Failed to initialize chat" },
      { status: 500 }
    )
  }
}
