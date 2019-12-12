const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

let name = null;
let number = null;
if (3 in process.argv) {
  name = process.argv[3];
}
if (4 in process.argv) {
  number = process.argv[4];
}

const url = `mongodb+srv://fullstack:${password}@cluster0-qoe6q.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model("Person", personSchema);

if (!!name && !!number) {
  const person = new Person({
    name,
    number
  });

  /* eslint-disable no-unused-vars */
  person.save().then(response => {
    /* eslint-enable no-unused-vars */
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then(result => {
    console.log("phonebook:");
    result.forEach(person => {
      console.log(person.name + " " + person.number);
    });
    mongoose.connection.close();
  });
}
