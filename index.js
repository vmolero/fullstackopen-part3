require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(bodyParser.json());

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
morgan.token("morganBody", function(req) {
  if ("body" in req && !isEmptyObject(req.body)) {
    return JSON.stringify(req.body);
  }
  return " ";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :morganBody"
  )
);

const PORT = process.env.PORT || 3001;

function validatePersonProperty(property, person) {
  return property in person && person[property].length > 0;
}

app.get("/api/persons", (request, response) => {
  return Person.findAll().then(people => response.json(people));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  return Person.find(id)
    .then(person => {
      if (person) {
        return response.json(person);
      }
      return response.status(404).send({ error: "Not found" });
    })
    .catch(err => next(err));
});

app.post("/api/persons", (request, response) => {
  const person = request.body;
  return addToPhoneBook(response, person);
});

function addToPhoneBook(response, person) {
  if (!validatePersonProperty("name", person)) {
    return response.status(400).send({ error: "Missing name" });
  }
  if (!validatePersonProperty("number", person)) {
    return response.status(400).send({ error: "Missing number" });
  }
  return Person.save(person)
    .then(response => {
      console.log(`added ${person.name} number ${person.number} to phonebook`);
      return response;
    })
    .then(savedPerson => response.json(savedPerson.toJSON()));
}
app.put("/api/persons/:id", (request, response) => {
  return response.sendStatus(400);
});

app.delete("/api/persons/:id", (request, response, next) => {
  return Person.findByIdAndRemove(request.params.id)
    .then(result => {
      return response.status(204).end();
    })
    .catch(error => next(err));
});

app.get("/info", (request, response) => {
  return Person.findAll().then(persons => {
    const now = new Date();
    const info = `<p>Phonebook has info for ${persons.length} people.</p><p>${now}</p>`;
    return response.send(info);
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
