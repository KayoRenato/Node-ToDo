const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username == username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" }); x
  }

  request.user = user;

  return next();

}

app.get('/users', (request, response) => {
  return response.json(users);
})

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username Exists!" });
  };

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newToDo);

  return response.status(201).json(newToDo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);


  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todoExists.title = title;
  todoExists.deadline = new Date(deadline);


  return response.json(todoExists);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todoExists.done = true;

  return response.json(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExistsIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoExistsIndex === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(todoExistsIndex, 1);

  return response.status(204).json();

});

module.exports = app;