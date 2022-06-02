const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response
      .status(400)
      .send({ error: "You must send the 'username'; " });
  }

  const foundUser = users.find((user) => user.username === username);

  if (!foundUser) {
    return response
      .status(404)
      .send({ error: `Username: '${username}' not found.` });
  }

  response.locals.user = foundUser;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const foundUsername = users.find((user) => user.username === username);

  if (foundUsername) {
    return response
      .status(400)
      .send({ error: `Username: '${username}' already exists.` });
  }

  const user = { id: uuidv4(), name, username, todos: [] };

  users.push(user);

  response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;

  const userTodos = user.todos;

  response.send(userTodos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).send({ error: `Todo: '${id}' not exists.` });
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  response.send(foundTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).send({ error: `Todo: '${id}' not exists.` });
  }

  foundTodo.done = true;

  response.send(foundTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { id } = request.params;

  const foundTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (foundTodoIndex === -1) {
    return response.status(404).send({ error: `Todo: '${id}' not exists.` });
  }

  user.todos.splice(foundTodoIndex, 1);

  response.status(204).end();
});

module.exports = app;
