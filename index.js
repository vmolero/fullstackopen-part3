const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();

app.use(bodyParser.json());
app.use(morgan("tiny"));

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

function validatePersonProperty(property, person) {
  return property in person && person[property].length > 0;
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
  return response.status(404).send({ error: "Not found" });
});

app.post("/api/persons", (request, response) => {
  const person = request.body;
  if (!validatePersonProperty("name", person)) {
    return response.status(400).send({ error: "Missing name" });
  }
  if (!validatePersonProperty("number", person)) {
    return response.status(400).send({ error: "Missing number" });
  }
  const existingPerson = persons.filter(p => p.name === person.name).pop();
  if (existingPerson) {
    return response.status(400).send({ error: "name must be unique" });
  }
  person.id = nextId(persons.map(n => n.id));
  persons = persons.concat(person);

  return response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = find(id);

  if (!person) {
    return response.status(404).send({ error: "Not found" });
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
