import { sqliteTable, text } from "drizzle-orm/sqlite-core";


export const todos_Table = sqliteTable("todos_table", {
  id: text().primaryKey(),  
  title: text().notNull(),
  status: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});
