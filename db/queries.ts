"server-only";


import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";


import { user, chat, User, task, Task, actionLog, ActionLog } from "./schema";


// Create and export the database instance
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
export const db = drizzle(client);


export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}


export async function createUser(email: string, password: string | null, name: string) {
  try {
    const passwordHash = password ? hashSync(password, genSaltSync(10)) : null;


    return await db.insert(user).values({ 
      email, 
      password: passwordHash, 
      name,
      membership: 'free',
      usage: '0.0000',
      stripecustomerid: null,
      stripesubscriptionid: null,
      previoussubscriptionid: null,
      provider: 'google',
    });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}


export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const users = await db.select().from(user).where(eq(user.id, userId));
    if (users.length === 0) {
      throw new Error("User not found");
    }


    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));


    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
          updatedAt: new Date(),
        })
        .where(eq(chat.id, id))
        .returning();
    }


    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    }).returning();
  } catch (error) {
    console.error("Failed to save chat in database:", error);
    throw error;
  }
}


export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}


export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.updatedAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}


export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}


type UpdateUserData = Partial<Pick<User, 'stripecustomerid' | 'stripesubscriptionid' | 'membership' | 'usage'>>;


export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    const [updatedUser] = await db
      .update(user)
      .set(data)
      .where(eq(user.id, userId))
      .returning();
    return updatedUser;
  } catch (error) {
    console.error("Failed to update user in database");
    throw error;
  }
}


export async function updateUserBystripecustomerid(
  stripecustomerid: string,
  data: Partial<Pick<User, "stripesubscriptionid" | "membership">>
) {
  try {
    const [updatedUser] = await db
      .update(user)
      .set(data)
      .where(eq(user.stripecustomerid, stripecustomerid))
      .returning();
    return updatedUser;
  } catch (error) {
    console.error("Failed to update user by Stripe customer ID in database");
    throw error;
  }
}


export async function updateUserUsage(userId: string, newUsage: string) {
  try {
    return await db
      .update(user)
      .set({ usage: newUsage })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user usage in database");
    throw error;
  }
}


export async function updateUserData(userId: string, data: Partial<Pick<User, 'membership' | 'usage' | 'stripecustomerid' | 'stripesubscriptionid' | 'previoussubscriptionid'>>) {
  try {
    return await db
      .update(user)
      .set(data)
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user data in database");
    throw error;
  }
}


// Task Queries
export async function createTask(
  userId: string,
  data: Pick<Task, "title" | "description" | "dueDate" | "status">
): Promise<Task> {
  try {
    const [newTask] = await db.insert(task).values({
      ...data,
      userId,
    }).returning();

    await logTaskAction({
      taskId: newTask.id,
      userId,
      actorType: 'user',
      actorId: userId,
      actionType: 'CREATE',
      details: { task: data },
    });

    return newTask;
  } catch (error) {
    console.error("Failed to create task in database");
    throw error;
  }
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: Partial<Pick<Task, "title" | "description" | "dueDate" | "status" | "completed" | "completedAt">>
): Promise<Task> {
  try {
    const [updatedTask] = await db
      .update(task)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(task.id, taskId))
      .returning();

    await logTaskAction({
      taskId,
      userId,
      actorType: 'user',
      actorId: userId,
      actionType: 'UPDATE',
      details: { updates: data },
    });

    return updatedTask;
  } catch (error) {
    console.error("Failed to update task in database");
    throw error;
  }
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  try {
    await logTaskAction({
      taskId,
      userId,
      actorType: 'user',
      actorId: userId,
      actionType: 'DELETE',
      details: null,
    });

    await db.delete(task).where(eq(task.id, taskId));
  } catch (error) {
    console.error("Failed to delete task from database");
    throw error;
  }
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    return await db
      .select()
      .from(task)
      .where(eq(task.userId, userId))
      .orderBy(desc(task.createdAt));
  } catch (error) {
    console.error("Failed to get user tasks from database");
    throw error;
  }
}

// Action Log Queries
export async function logTaskAction(data: Omit<ActionLog, "id" | "timestamp">): Promise<ActionLog> {
  try {
    const [newLog] = await db.insert(actionLog).values(data).returning();
    return newLog;
  } catch (error) {
    console.error("Failed to create action log in database");
    throw error;
  }
}

export async function getTaskActionLogs(taskId: string): Promise<ActionLog[]> {
  try {
    return await db
      .select()
      .from(actionLog)
      .where(eq(actionLog.taskId, taskId))
      .orderBy(desc(actionLog.timestamp));
  } catch (error) {
    console.error("Failed to get task action logs from database");
    throw error;
  }
}

export async function getUserActionLogs(userId: string): Promise<ActionLog[]> {
  try {
    return await db
      .select()
      .from(actionLog)
      .where(eq(actionLog.userId, userId))
      .orderBy(desc(actionLog.timestamp));
  } catch (error) {
    console.error("Failed to get user action logs from database");
    throw error;
  }
}