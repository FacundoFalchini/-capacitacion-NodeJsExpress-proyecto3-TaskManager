// Without moddleware: new request -> run route handler
// With middleware:    new request -> do something -> run route handler
// Podemos apuntar que rutas queremos hacer algo, por ejemplo autentificacion queremos en todas menos en login y sign up.

//EJEMPLOS:

//Esta es la funcion que se corre en DO SOMETHING
/*
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.send("GET REQUEST ARE DISABLED");
  } else {
    next(); //Si es cualquier cosa menos GET, le permitimos seguir
  }
  //next(); //Luego de do something, para que corra la ruta handler hay que llamar a next.
});
*/
/*
app.use((req, res, next) => {
  res.status(503).send("SERVICE UNDER MAINTENCE");
});
*/

//Liberia de TOKEN:
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    //Obtenemos el valor en el header de la request (token)
    const token = req.header("Authorization").replace("Bearer ", ""); //Quitamos la parte Bearer del valor.

    //Y ahora la queremos validar:
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET /*"thisismynewcourse"*/
    );
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }
    req.token = token; //Esto es para poder a la hora de salir de la cuenta, deletear el token correcto de esa sesion y no de otra sesion de otra misma cuenta. (toJSON)
    req.user = user; //Ya le damos al handler el usuario xq ya lo verificamos asi le ahorramos el tiempo.
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

//La exportamos para que pueda ser usada en otros lados
module.exports = auth;
