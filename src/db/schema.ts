import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Define the todos table schema with a text-based UUID for the `id` field
export const todosTable = sqliteTable("todos_table", {
  id: text().primaryKey(),  // Define `id` as text to store UUIDs as strings
  title: text().notNull(),
  status: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});
