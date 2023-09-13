const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      //Si se esta creando una task, hay que si o si decir quien es el duenio y que ese duenio es un objeto de tipo objecjt ID.
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", //ES EL MISMO NOMBRE QUE EL MODEL User, y asi se puede obtener el perfil del usuario cada vez que tengamos acceso a alguna tarea en especifico... nos permite linkear mas facil con ese usuario en lugar de hacer mas querys.
    },
  },
  {
    timestamps: true,
  }
);

//El hacerlo schema es basicamente para aprovechar todas las cosas que nos permite el schema que simplemente el objeto solo no.
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

/*
const task = new Task({
  description: "Learn the Mongoose Library",
  completed: false,
});

const task2 = new Task({
  description: "    Probando a s b s    ",
});
*/
/*
  task
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
    */

/*
  task2
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
  */

///////////////////////////////////////////////////////////////////
//DATA VALIDATION:
// *Required ---> hace obligatorio ingresar ese atributo para poder agregar la instancia que sea del elemento que sea.
// *Podemos crear CUSTOM, es decir validadores que se nos ocurran con VALIDATE(). Esto es dado, que mongoose por su parte no brinda muchas validaciones, pero si nos permite hacerlas a nuestras necesidades.
//De todas maneras, hay liberiras que hacen todo tipo de validaciones:  NPM VALIDATOR
