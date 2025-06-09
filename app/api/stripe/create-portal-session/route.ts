import { NextResponse } from "next/server"

import { getUser } from "@/lib/queries"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const users = await getUser(email)

    if (users.length === 0 || !users[0].stripecustomerid) {
      return NextResponse.json(
        { error: "User not found or no Stripe customer ID" },
        { status: 404 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: users[0].stripecustomerid,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
