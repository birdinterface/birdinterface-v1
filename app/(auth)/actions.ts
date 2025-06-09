"use server"

import { z } from "zod"

import { createUser, getUser } from "@/lib/queries"

import { signIn } from "./auth"

const authFormSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  })
  .partial({
    name: true,
  })

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data"
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { status: "success" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" }
    }

    return { status: "failed" }
  }
}

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data"
}

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
    })

    if (!validatedData.email || !validatedData.password) {
      return { status: "invalid_data" }
    }

    let [user] = await getUser(validatedData.email)

    if (user) {
      return { status: "user_exists" }
    } else {
      await createUser(
        validatedData.email,
        validatedData.password,
        validatedData.name || ""
      )
      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })

      return { status: "success" }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" }
    }
    return { status: "failed" }
  }
}
