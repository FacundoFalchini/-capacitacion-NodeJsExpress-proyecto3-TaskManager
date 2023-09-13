//Vamos a crear diferentes routers para las distintas clasificaciones de HTTP ENDPOINTS que tenemos (tasks y users)

//Sintaxis:
//Crear el nuevo router.
//Definir la ruta
//Registrarlo con nuestra express aplication.
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router(); //Ahora es router.get etc en lugar de app.get etc.
const User = require("../models/user");
const auth = require("../middleware/authentication");

//HTTP Endpoint para crear usuario. Tambien crea el token y lo almacena.
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//HTTP endpoint para logearse, tambien genera token al logearse
router.post("/users/login", async (req, res) => {
  try {
    //Asi como estan las predefinidas, podemos crear las funciones nuestras
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    //Con la funcion, solamente reotrnamos al usuario lo que nos interesa que vea... para asi hacer mas privada la info. Esto era antes de usar la forma automatizada (METODO toJSON)
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//HTTP enpoing para logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//HTTP enpoing para logout TODAS las sesiones
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []; //Borramos todos los tokens del arreglo

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//Solo corre si esta autentificado, esta ruta le permite al usuario obtener su perfil. Se corre el auth el cual toma el token que se pasa en el header de la request y hace todo el trabajo de autentificacion.
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    //El codigo debajo de save() solo correra si sale bien la promesa, sino se va directo a catch.
    await user.save();
    res.status(201);
    res.send(user);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

//HTTP endpoint para ACTUALIZAR un user por ID. Ya no es mas por ID, sino que se requiere estar autentificado.

router.patch("/users/me", auth, async (req, res) => {
  //Lo que quiere modificar con la req lo podemos obtener:
  const updates = Object.keys(req.body); //Agarra el objeto y keys retorna un arreglo donde cada elemento es un atributo en req.body.
  const allowedUpdates = ["name", "email", "password", "age"];

  //Ahora queremos que todos los updates esten en allowedUpdates. Every sera true, si cada update dentro de updates retorna true en includes.
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    //A diferencia de mongo, mongoose no necesitamos usar el $set y esas cosas, sino directamente un objeto con las propiedades a modifcar.
    //El tercer argumento es el objeto de opciones. El new es para que retorne el objeto modifcado y no el antiguo, el segundo es que valide la data que se escribe tambien.

    /*
    ESTA FORMA NO LA USAMOS PORQUE NO FUNCIONA CORRECTAMENTE CON MIDDLEWEAR. Porque no es un SAVE. Entonces, cambiamos todo a pata y luego hacemos el save(). 
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    */
    //const user = await User.findById(req.params.id);
    updates.forEach((update) => {
      req.user[update] = req.body[update]; //No podemos hacer . porque no sabemos que propiedad, es dinamico, entonces usamos la notacion []
    });

    //await user.save(); //Y ACA ES DONDE SE VA A EJECUTAR MIDDLEWAR.
    await req.user.save();

    res.send(req.user); //Si todo sale bien, le enviamos la data nueva
  } catch (e) {
    res.status(400).send(e);
  }
});

//HTTP endpoint para eliminar un user por id
router.delete("/users/me", auth, async (req, res) => {
  try {
    //Tenemos acceso al user en request porque lo atamos antes.
    //const user = await User.findByIdAndDelete(req.user._id);
    //if (!user) {
    //  return res.status(404).res.send();
    // }
    await req.user.deleteOne(); //Esta sola linea hace el mismo trabajo q las lineas de arriba.
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

//HTTP enpoint para avatar upload.
//En este objeto va toda la configuracion para la herramienta. Se setea para que suba las cosas en un directorio llamado avatars.
const upload = multer({
  //Destination de donde estan todos los archivos que queremos subir
  //dest: "avatars", Si borramos esto, multer ya no almacena en el directorio, sino que va a pasar la data directamente a la FUNCION CALLBACK del http endpoint upload
  //Podemos limitar el tamanio
  limits: {
    fileSize: 1000000, //Esta pensado en bytes = 1MB
  },
  //Limitar la extension, aca van las q no queremos
  fileFilter(req, file, cb) {
    //Para verificar que sea de determinados tipos, usamos mathc que se le pasa una REGULAR EXPRESION. El \. significan que estamos buscando eso en el string. Y el $ significa que tiene que estar al final.
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      //Si algo sale mal, llamamos a la callback (cb)
      return cb(new Error("Please upload an image"));
    }
    //Si algo sale bien, tambien se llama
    cb(undefined, true);
  },
});

//Avatar es el nombre de la key cuando se registra el middleware.
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //Creamos esto en el user
    //Esto solo se puede acceder cuando esta comentada la carpeta donde guardar la data.
    //req.user.avatar = req.file.buffer;

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  }, //Agregar la siguiente funcions nos permite manejar el error que se retorna. Esta funcion necesita tener los 4 parametros tal cual, porque es lo que le permite a express saber que esta funcion es para los errores que no se tienen en cuenta en el muler.
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//HTTP endpoint para eliminar un avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

//HTTP endpoint para obtener el avatar de un usuario x su ID
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error(); //Esto corta el try y va directo al catch
    }

    //Avisamos que tipo de data vamos a mandar
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;

/*
//HTTP endpoint para CREAR users (VIEJA, ahora con ASYNC)
app.post("/users", (req, res) => {
  //console.log(req.body);
  //res.send("testing!");

  //Le pasamos la data ya parsed, es la data que el usuario ingresa cuando hace el post. Esto es gracias la linea 11 que lo hace.
  const user = new User(req.body);

  //Y guardamos el usuario en la base de datos. Es en el caso de exito de la promesa donde mandamos una respuesta, en este caso el objeto agregado.
  user
    .save()
    .then(() => {
      res.status(201);
      res.send(user);
    })
    .catch((e) => {
      res.status(400);
      res.send(e);
    });
});


//HTTP endpoint para LISTAR los users: VERSION ASYNC AWAIT
//Esta y todas las siguientes tienen AUNTENTIFICACION (gracias a middleware)
Esta ya no nos sirve, porque no quremos q un usuario vea todas las otras request de los demas usuarios ---> reemplazada por ME.

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});


//HTTP endpoint para LISTAR UN user por ID:
//Usamos :id para poder acceder al valor dinamico id ---> que lo obtenemos con req.params. Ademas mongoose transformar automaticamente el string a un ObjectID.
//YA NO SE NECESITA MAS... UN USUARIO NO DEBERIA PODER VER LAS COSAS DE OTRO USUARIO SOLO CONOCIENDO SU ID. 
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(404).send();
  }
});


//CAMBIADO 
//HTTP endpoint para eliminar un user por id
router.delete("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).res.send();
    }

    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});




*/
//REQ Y RES ES LO QUE USA EXPRESS

module.exports = router;
