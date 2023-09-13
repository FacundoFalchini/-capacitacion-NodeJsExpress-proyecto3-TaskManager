//Aca va a estar todo el codigo necesario para llenar la database de data necesaria para hacer los tests

const jwt = require("jsonwebtoken"); //Para generar el token
const mongoose = require("mongoose"); //Para generar el objectID
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

//Creamos un usuario para hacer test como los de login y demas que necesitan algun usuario existente:
const userOne = {
  _id: userOneId,
  name: "Mike",
  email: "mike@example.com",
  password: "helloworldfuckingworld",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwo = {
  _id: userTwoId,
  name: "Donald",
  email: "laweaeaea@example.com",
  password: "asdkaskdaskasdkaksd",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First task",
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second task",
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third task",
  completed: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
};
