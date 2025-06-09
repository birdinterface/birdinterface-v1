import { NextResponse } from "next/server"

import { auth } from "@/app/(auth)/auth"
import { createRecurringTask, getUserRecurringTasks } from "@/lib/queries"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await getUserRecurringTasks(session.user.id)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("API Error fetching recurring tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch recurring tasks" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dueDate, status, recurrencePattern } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const taskData = {
      title,
      description,
      dueDate,
      status: status || "pending",
      recurrencepattern: recurrencePattern,
    }

    const newTask = await createRecurringTask(session.user.id, taskData as any)
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("API Error creating recurring task:", error)
    return NextResponse.json(
      { error: "Failed to create recurring task" },
      { status: 500 }
    )
  }
}
