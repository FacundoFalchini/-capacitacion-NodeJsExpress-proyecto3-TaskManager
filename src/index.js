//Este el punto de comienzo de nuestra app ---> Aca inicializamos el express server y la levanta a la app. Pero lo que hace en si lo que hace la app experss esta definido en los 2 routers.
//npm run dev (como tiene el nodemon, luego solamnete con guardar los cambios se activa todo solo)
//Usamos bcrypt.js (paqute de npm) para agregar seguridad en las contrasenias. Basicamente lo que hace es poner un HASH, el cual en caso de ser hackeado, este algortimo no es reversible, por lo que no podran obtener la contrasenia. Dado que los hash algorithm son algoritmos sin vuelta.

//ERA EL COMIEZO, HASTA QUE PARA HACER LOS TEST CREAMOS APP.JS Y PASAMOS CASI TODO AHI
const app = require("./app");

/*
const express = require("express");
const multer = require("multer");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const Task = require("./models/task");
const app = express();

//Esto parse incoming Json a un objeto asi podemos accederlo en el REQ.
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

*/

const port = process.env.PORT; //|| 3000; Ahora el 3000 es variable de ambiente.

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

/*
const jwt = require("jsonwebtoken");

const myFunction = async () => {
  const token = jwt.sign({ _id: "abc123" }, "thisismynewcourse", {
    expiresIn: "7 days",
  });
  console.log(token);

  const data = jwt.verify(token, "thisismynewcourse");
  console.log(data);
};

const myFunction = async () => {
  await Task.deleteMany({ owner: "64a36de2a8c7ff6d527d6e3e" });
};
myFunction();


myFunction();
*/

//EXPRESS por default no acepta subir files, pero hay una libreria de npm que permite hacerlo (del mismmo equipo que express) ---> NPM MULTER

//NPM Sharpe para procesar las imagenes que dan el ususario, antes que las guardameos. Asi: 1) podemos cambiarle el tamanio a uno especifico, 2) cambiar el tipo de imagen y asi tener todos en el mismo.

//NPM sendgrid ---> para enviar emails.

//NOTA DE QUE AGREGAR PARA QUE ENCUENTRE EL DEV.ENV:
/*
Aquí, la opción -f se utiliza para especificar el archivo de variables de entorno (dev.env en tu caso). 
El uso de -f en env-cmd permite especificar el archivo de variables de entorno que deseas cargar. Por defecto, env-cmd buscará un archivo llamado .env en las rutas predeterminadas (./.env, ./.env.js, ./.env.json), pero al proporcionar -f seguido de la ruta del archivo (./config/dev.env), estás indicando explícitamente que se utilice ese archivo en lugar del archivo .env predeterminado.

En resumen, el uso de -f es necesario en tu caso porque estás utilizando un archivo llamado dev.env en lugar de .env. Al agregar -f seguido de la ruta al archivo dev.env, env-cmd puede encontrar y cargar correctamente las variables de entorno desde ese archivo específico
*/
