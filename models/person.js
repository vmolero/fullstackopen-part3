const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    minlength: 3
  },
  number: { type: String, required: true, minlength: 8 }
});

personSchema.plugin(uniqueValidator);

const Person = mongoose.model("Person", personSchema);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

function save({ name, number }) {
  const person = new Person({
    name,
    number
  });

  return person.save();
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

function findByIdAndRemove(id) {
  return Person.findByIdAndRemove(id);
}

function findByIdAndUpdate(id, person, options) {
  return Person.findByIdAndUpdate(id, person, options).then(_r => {
    const person = _r;
    return person;
  });
}

module.exports = {
  find,
  findBy,
  findAll,
  findByIdAndRemove,
  findByIdAndUpdate,
  save
};
