const mongoose = require("mongoose");
//const validator = require("validator");

//const connectionURL = "mongodb://127.0.0.1:27017/task-manager-api";
//USANDO LA VARIABLE DE AMBIENTE
const connectionURL = process.env.MONGODB_URL;

//En versiones actuales, ya no se le pasa mas parametros al connect.
//1) El useCreateIndex: true, ya no es necesario ya que por default la creacion de indices es habilitada de forma predeterminada.
//2) useNewUrlParser tambien fue eliminada dado que el analizador de URL nuevo ya se usa de forma predeterminada.
//Una unica diferencia con mongodb, es que no es necesario especificar la BD por separado, sino que se coloca al final de la URL de conexion.

mongoose
  .connect(connectionURL)
  .then(() => {
    console.log("Conexión exitosa a MongoDB");
  })
  .catch((error) => {
    console.log("Error de conexión a MongoDB:", error);
  });
