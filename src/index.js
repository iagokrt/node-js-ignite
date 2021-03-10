const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(404).json({error: 'Username does not exists!'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  // create a new user with name, username, to-dos and uuid generated via lib uuidv4
  const { name, username } = request.body;
  
  const usernameUsage = users.some((user) => user.username === username)

  if (usernameUsage) {
    return response.status(400).json({error: 'Username already exists!'})
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const { todos } = user

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // create a todo for a specific user
  const { user } = request;

  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  // const userIndex = users.findIndex((user) => user.username === username);

  // const { todos } = users[userIndex]
  
  user.todos.push(newTodo)

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // update a todo of a specific user
  const { user } = request
  const { id } = request.params // task id
  const { title, deadline } = request.body
    
  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({error: 'To-Do ID does not exists!'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    // update a todo with done status
    const { user } = request; 

    const { id } = request.params; // to-do id
    
    const todo = user.todos.find((todo) => todo.id === id)

    if (!todo) {
      return response.status(404).json({error: 'To-Do ID does not exists!'})
    }

    if (!todo.done) {
      todo.done = true
    }

    return response.status(201).json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    // delete a todo of a specific user
    const { user } = request;

    const { id } = request.params

    const foundTodo = user.todos.find((todo) => todo.id === id)

    if (!foundTodo) {
      return response.status(404).json({error: 'unable to delete! To-Do ID not found'})
    }

    user.todos.splice(foundTodo, 1)

    return response.status(204).json(user.todos)

});

module.exports = app;