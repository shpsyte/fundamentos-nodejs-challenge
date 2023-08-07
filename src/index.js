const express = require("express");
const cors = require("cors");
const { v4: randomUUID } = require("uuid");
const zod = require("zod");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const schema = zod.object({
    name: zod.string().min(3).max(50),
    username: zod.string().min(3).max(50),
  });

  try {
    const userExists = users.find(
      (user) => user.username === request.body.username
    );

    if (!userExists) {
      const user = {
        id: randomUUID(),
        ...schema.parse(request.body),
        todos: [],
      };
      users.push(user);
      return response.status(201).json(user);
    } else {
      return response.status(400).json({ error: "User already exists" });
    }
  } catch (error) {
    return response.status(400).json({ error });
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const schema = zod.object({
    title: zod.string().min(3).max(50),
    deadline: zod
      .string(() => "Invalid date format. Use YYYY-MM-DD")
      .refine((data) => {
        const date = new Date(data);
        return date.toString() !== "Invalid Date";
      })

      .transform((data) => new Date(data)),
  });

  // {
  //   id: 'uuid', // precisa ser um uuid
  //   title: 'Nome da tarefa',
  //   done: false,
  //   deadline: '2021-02-27T00:00:00.000Z',
  //   created_at: '2021-02-22T00:00:00.000Z'
  // }

  try {
    const todo = {
      id: randomUUID(),
      done: false,
      created_at: new Date(),
      ...schema.parse(request.body),
    };
    user.todos.push(todo);
    return response.status(201).json(todo);
  } catch (error) {
    return response.status(400).json({ error });
  }
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const { title, deadline } = request.body;
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;
  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoIndex, 1);
  return response.status(204).send();
});

module.exports = app;
