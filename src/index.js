const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const usernameExists = users.find((user) => user.username === username);

  if (usernameExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const updateTodo = user.todos.find((todo) => todo.id === id);

  if (!updateTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  // Object.assign(updateTodo) = {
  //   title, deadline
  // }

  updateTodo.title = title;
  updateTodo.deadline = new Date(deadline);

  return response.json(updateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const updateTodo = user.todos.find((todo) => todo.id === id);

  if (!updateTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  updateTodo.done = true;

  return response.json(updateTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const deleteTodo = user.todos.find((todo) => todo.id === id);
  if (!deleteTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }
  user.todos.splice(deleteTodo, 1);
  // const deleteTodo = user.todos.findIndex((todo) => todo.id === id);
  // if (deleteTodo === -1) {
  //   return response.status(404).json({ error: "Mensagem do erro" });
  // }
  // user.todos.splice(deleteTodo, 1);

  return response.status(204).json();
});

module.exports = app;
