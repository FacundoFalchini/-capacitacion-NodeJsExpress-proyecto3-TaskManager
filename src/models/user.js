const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

//Haciendo el esquema, nos permite usar MIDDLEWEAR
const userSchema = new mongoose.Schema(
  {
    //Adentro de cada propiedad, en el objeto se pueden agregar caracteristicas que tiene que tomar ese valor.
    name: {
      type: String,
      required: true,
      trim: true, //Quita todos los espacios antes o al final del nombre automaticamente
    },
    age: {
      type: Number,
      //Como no es obligatoria la edad, ponemos un valor default
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age MUST be a positive number");
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true, //Esto hay que hacerlo antes, porque sino los espacios cuentan como longitud.
      minlength: 7, //Tambien se podria hacer con un validate
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password can not contain 'password'");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    //Este campo nos permite almacenar el buffer con la data binaria de la imagen en la database junto con el usuario a la cual pertenece.
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//Esto no se almacena en la database, es una referencia a mongoose para que sepa como se relaciona el usuario con las taks
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

//El toJSON es especial porque CORRE AUNQUE NUNCA SE LLAME.
//COMO? ---> Express cuando pasamos un OBJETO a response.send, DETRAS DE ESCENA LLAMA JSON.stringfly. Cuando estamos con toJSON este metodo se llama cada vez que el objeto se envie en un send, sin la necesidad de aclarar en el retorno del send que usemos esta funcion.
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject(); //En principio es lo mismo que antes, pero ahora este objeto lo podemos modificar.

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET /*"thisismynewcourse"*/
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  //Primer lo buscamos por el email
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("Unable to login");
  }

  //Si existe, queremos veriricar la password plana con la hash
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

//pre ---> hacer algo ANTES de un evento como SAVE
userSchema.pre("save", async function (next) {
  //this ---> documento que esta por ser save, en este caso usuario.
  //next ---> se llama a next cuando se termina el comportamiento que queremos que se corra antes de salvar, no alcanza con decir cuando termina la funcion porque no contempla comportamiento asincronico.
  const user = this;

  //Solo hacemos el hash si se realizo un cambio en la contrasenia. O si se crea uno nuevo y este campo tambien cambia.
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//Borra las tareas de un usuario cuando este elimina su cuenta (esto tambien podria hacerse sin middlewaer directamente en el metodo delete de user tambien). Ahora, siempre que se borre un usuario, este codigo se corre tambien.
//Diferencias con el video, uso deleteOne y no remove. Ademas si no agrego el objeto con esas 2 opciones no borra nada no se por que.
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

/*
  //Creamos un User:
  const me = new User({
    name: "Facundo",
    age: 23,
  });
  
  const me2 = new User({
    name: "Facundo",
    age: -1,
  });
  
  const me3 = new User({
    name: "Facundo",
    age: 23,
    email: "facundofaclchini@gmail.com",
  });
  
  const me4 = new User({
    name: "Facundo",
    age: 23,
    email: "facundofaclchini@gmail.com",
    password: "unabuenacontrapapa123",
  });
  */

//Para agregarlo a la database:
/*
  me.save()
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
  */

/*
  me3
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
  */

/*
  me4
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
  */

//Ejemplo de error:
/*
  me2
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
    */
