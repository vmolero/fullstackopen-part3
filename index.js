const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const PORT = 3001;
let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

function find(id) {
  return persons.filter(person => person.id === parseInt(id)).pop();
}

// Random between [min, max)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function nextId(existingIds) {
  let candidateId = null;
  do {
    candidateId = getRandomInt(5, 100000);
  } while (existingIds.includes(candidateId));
  return candidateId;
}

app.get("/api/persons", (request, response) => {
  return response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = find(id);
  if (person) {
    return response.json(person);
  }
  return response.sendStatus(404);
});

app.post("/api/persons", (request, response) => {
  const person = request.body;
  person.id = nextId(persons.map(n => n.id));

  persons = persons.concat(person);

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = find(id);

  if (!person) {
    return response.sendStatus(404);
  }
  persons = persons.filter(person => person.id !== parseInt(id));
  return response.send(person);
});

app.get("/info", (request, response) => {
  const now = new Date();
  const info = `<p>Phonebook has info for ${
    persons.length
  } people.</p><p>${now}</p>`;
  response.send(info);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
