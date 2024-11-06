import { Hono } from "hono";
import { db } from "./db";
import { todos_Table } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// Error handler function
const errorHandler = (error: unknown) => {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'An unexpected error occurred' };
};

// Validate todo input
const validateTodo = (title: string) => {
  if (!title?.trim()) {
    throw new Error('Invalid title');
  }
  if (title.length > 50) {
    throw new Error('Title must be less than 50 characters');
  }
};

// Create a new todo
app.post("/todos", async (c) => {
  try {
    const { title } = await c.req.json();
    validateTodo(title);

    const todo = {
      id: crypto.randomUUID(), 
      title: title.trim(),
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [newTodo] = await db
      .insert(todos_Table)
      .values(todo)
      .returning();

    return c.json(newTodo, 201);
  } catch (error) {
    return c.json(errorHandler(error), 400);
  }
});

// Get all todos
app.get("/todos", async (c) => {
  try {
    const todos = await db
      .select()
      .from(todos_Table)
      .all();

    return c.json(todos);
  } catch (error) {
    return c.json({ error: 'Failed to fetch todos' }, 500);
  }
});

// Get a single todo by ID
app.get("/todos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const todo = await db
      .select()
      .from(todos_Table)
      .where(eq(todos_Table.id, id))
      .get();

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(todo);
  } catch (error) {
    return c.json(errorHandler(error), 400);
  }
});

// Update an existing todo by ID
app.put("/todos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { title, status } = await c.req.json();

   
    if (title) {
      validateTodo(title);
    }

    const todo = await db
      .select()
      .from(todos_Table)
      .where(eq(todos_Table.id, id))
      .get();

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    const [updatedTodo] = await db
      .update(todos_Table)
      .set({
        title: title?.trim() ?? todo.title,
        status: status ?? todo.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(todos_Table.id, id))
      .returning();

    return c.json(updatedTodo);
  } catch (error) {
    return c.json(errorHandler(error), 400);
  }
});

// Delete a todo by ID
app.delete("/todos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const todo = await db
      .select()
      .from(todos_Table)
      .where(eq(todos_Table.id, id))
      .get();

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    await db.delete(todos_Table).where(eq(todos_Table.id, id));
    return c.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return c.json(errorHandler(error), 400);
  }
});

// Delete all todos
app.delete("/todos", async (c) => {
  try {
    await db.delete(todos_Table).all();
    return c.json({ message: 'All todos deleted successfully' });
  } catch (error) {
    return c.json(errorHandler(error), 400);
  }
});

export default app;
