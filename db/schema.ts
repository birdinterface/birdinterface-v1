import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, timestamp, json, uuid, decimal, text, boolean } from "drizzle-orm/pg-core";


export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 64 }).notNull(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  membership: varchar("membership", { length: 64 }).notNull().default('free'),
  stripecustomerid: varchar("stripecustomerid", { length: 256 }),
  stripesubscriptionid: varchar("stripesubscriptionid", { length: 256 }),
  previoussubscriptionid: varchar("previoussubscriptionid", { length: 256 }),
  usage: decimal("usage", { precision: 10, scale: 4 }).notNull().default('0.0000'),
  provider: varchar("provider", { length: 20 }).notNull().default('credentials'),
});


export type User = InferSelectModel<typeof user>;


export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});


export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export const task = pgTable("Task", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: varchar("status", { length: 64 }).notNull().default('todo'),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Task = InferSelectModel<typeof task>;

export const actionLog = pgTable("ActionLog", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  taskId: uuid("taskId")
    .notNull()
    .references(() => task.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  actorType: varchar("actorType", { length: 20 }).notNull(), // 'user' or 'ai'
  actorId: varchar("actorId", { length: 256 }).notNull(),
  actionType: varchar("actionType", { length: 64 }).notNull(),
  details: json("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type ActionLog = InferSelectModel<typeof actionLog>;
