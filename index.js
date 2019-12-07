require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static("build"));

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
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model("Person", personSchema);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

function savePerson({ name, number }) {
  const person = new Person({
    name,
    number
  });

  return person.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`);
    return response;
  });
}

function findBy(criteria) {
  return Person.find(criteria).then(result => {
    return result.map(person => person.toJSON());
  });
}
function findAll() {
  return findBy({});
}

function find(id) {
  return Person.findById(id).then(person => person.toJSON());
}

function validatePersonProperty(property, person) {
  return property in person && person[property].length > 0;
}

app.get("/api/persons", (request, response) => {
  return findAll().then(people => response.json(people));
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  return find(id).then(person => {
    if (person) {
      return response.json(person);
    }
    return response.status(404).send({ error: "Not found" });
  });
});

app.post("/api/persons", (request, response) => {
  const person = request.body;
  if (!validatePersonProperty("name", person)) {
    return response.status(400).send({ error: "Missing name" });
  }
  if (!validatePersonProperty("number", person)) {
    return response.status(400).send({ error: "Missing number" });
  }
  return findBy({ name: person.name }).then(result => {
    const existingPerson = result.pop();
    if (existingPerson) {
      return response.status(400).send({ error: "name must be unique" });
    }
    return savePerson(person).then(savedPerson =>
      response.json(savedPerson.toJSON())
    );
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  find(id).then(person => {
    if (!person) {
      return response.status(404).send({ error: "Not found" });
    }
    return response.sendStatus(400);
  });
});

app.get("/info", (request, response) => {
  return findAll().then(persons => {
    const now = new Date();
    const info = `<p>Phonebook has info for ${persons.length} people.</p><p>${now}</p>`;
    return response.send(info);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
