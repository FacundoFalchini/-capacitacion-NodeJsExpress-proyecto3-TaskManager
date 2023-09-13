const express = require("express");
const multer = require("multer");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const Task = require("./models/task");

const app = express();

//Aca no hacemos el listen asique nos da igual el port.
//const port = process.env.PORT; //|| 3000; Ahora el 3000 es variable de ambiente.

//Esto parse incoming Json a un objeto asi podemos accederlo en el REQ.
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
