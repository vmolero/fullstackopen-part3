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

app.post("/api/persons", (request, response, next) => {
  const person = request.body;
  return addToPhoneBook(response, person).catch(err => next(err));
});

function addToPhoneBook(response, person) {
  return Person.save(person)
    .then(response => {
      console.log(`added ${person.name} number ${person.number} to phonebook`);
      return response;
    })
    .then(savedPerson => savedPerson.toJSON())
    .then(person => response.json(person));
}
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      return response.json(updatedPerson.toJSON());
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  return (
    Person.findByIdAndRemove(request.params.id)
      /* eslint-disable no-unused-vars */
      .then(result => {
        /* eslint-enable no-unused-vars */
        return response.status(204).end();
      })
      .catch(err => next(err))
  );
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

  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
