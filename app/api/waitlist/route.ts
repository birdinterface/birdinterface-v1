import { NextResponse } from "next/server"

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID
// The server prefix is the part of the API key after the hyphen
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_API_KEY?.split("-")[1]

export async function POST(request: Request) {
  try {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
      console.error("Missing required Mailchimp environment variables")
      throw new Error("Missing required Mailchimp configuration")
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`

    const response = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      // Check if the error is because the email is already subscribed
      if (data && data.title === "Member Exists") {
        return NextResponse.json(
          { message: "You're already signed up!" },
          { status: 200 }
        )
      }

      console.error("Mailchimp error:", {
        error: data,
        listId: MAILCHIMP_LIST_ID,
        serverPrefix: MAILCHIMP_SERVER_PREFIX,
      })

      throw new Error(data.detail || "Failed to subscribe to the waitlist.")
    }

    return NextResponse.json(
      { message: "Successfully joined waitlist" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Waitlist submission error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred."
    return NextResponse.json(
      { error: `Failed to join Alpha. ${errorMessage}` },
      { status: 500 }
    )
  }
}
