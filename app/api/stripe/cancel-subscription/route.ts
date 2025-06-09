import { NextResponse } from "next/server"

import { getUser, updateUserData } from "@/lib/queries"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const users = await getUser(email)

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    if (user.stripesubscriptionid) {
      // Save current subscription ID to previous subscription ID
      await updateUserData(user.id, {
        previoussubscriptionid: user.stripesubscriptionid,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
