//TODAS ESTAS PRUEBAS VAN A LA DATABASE TASK-MANAGER-API-TEST porque es la ruta que le dimos en las variables de envirmoment.

//Usamos supertest para probar una app de express (como task maganer)
const request = require("supertest");

//Le damos acceso a la aplicacion (y ANTES de escucharla). Pero como hacemos esto, porque la creamos en index y ahi mismo es escuchada. Asique hay que acomodar un poco el codigo.
//Creamos el file app.js donde creamos todo pero ahi no se hace el listen, este se mantuvo en index
const app = require("../src/app");

const User = require("../src/models/user"); //Esto es para tener acceso a los metodos de mongoose model como deleteMany, etc.

const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

//Esta funcion corre antes de CADA TEST INDIVIDUAL que hay en este file. Esto es porque queremos asegurarnos que todos corran con la misma informacion en la database.
beforeEach(setupDatabase);

//A diferencia de los otros testeos, cuando probamos una APP, al test hay que pasarle la APLICACION, el http metodo y la url del metodo.
//Tambien hay que pasarle la data usando send.
test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Facundo TESTING",
      email: "facundo@gmail.com",
      password: "probando123",
    })
    .expect(201);

  //Cosas que podemos hacer (AFIRMACIONES/ASSERTS) con el cuerpo de la respuesta de la promesa.

  //Afirmar que la database cambio correctamente, basicamente buscamos en la database en la que estamos conectados si existe es decir si se inserto el usuario.
  const user = await User.findById(response.body.user._id); //fetch user desde la base de datos
  expect(user).not.toBeNull(); //Esperamos que NO sea nulo

  //Afirmaciones SOBRE LA RESPUESTA:
  //expect(response.body.user.name).toBe('Facundo TESTING')
  //Y haciendo asi, estamos testeando 3 cosas, el nombre, el email y el token:
  expect(response.body).toMatchObject({
    user: {
      name: "Facundo TESTING",
      email: "facundo@gmail.com",
    },
    token: user.tokens[0].token,
  });
  //Queremos que NO sea esa, sino que sea la hash
  expect(user.password).not.toBe("probando123");
});

//Probamos un login con informacion correcta.
test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: "mike@example.com",
      password: "helloworldfuckingworld",
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);

  //Al segundo, porque si se esta logeando, quiere decir que ya se creo el usuario (token 0) y al logerse tiene un nuevo token que debe coincidir con el segundo almacenado. Queremos que el token que ESTA EN LA RESPUESTA de la request login coincida con el almacenado en el user de la bd.
  expect(response.body.token).toBe(user.tokens[1].token);
});

//Probamos un login con informacion incorrecta y el codigo espera el 400.
test("Should not login not existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "mike@example.com",
      password: "helloworldfuckingworldMAL",
    })
    .expect(400);
});

//Ahora probamos testing en http metodos que requeiren autentificacion.
//Hay que decirle a supertest acerca del autentificador header. Esto dara correcto si dicho token existe.
test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

//Ahora la pruba para ver el perfil, pero sin pdoer pasar la autentificacion
test("Should not get profile for unauthenticated user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${"2131aisdas"}`)
    .send()
    .expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  //Una vez borrado, al buscarlo en la data base user deberia ser null
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${"2131aisdas"}`)
    .send()
    .expect(401); //El error q da el auth es 401, no el 400 que da el catch de delete
});

//attach es de supertest y nos permiet attach un field. Basicamente sube (upload) eso que se pasa al endpoint
test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/tigre.jpg")
    .expect(200);

  //Sumamos otro chequeo mas
  const user = await User.findById(userOneId);
  //Vemos si user.avatar es del tipo Buffer. Usamos EQUAL xq sabemos que en memoria los objetos son diferentes x mas que sean iguales. Si la imagen se sube, esta efectivamente la guardamos como buffer.
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      email: "uwu@example.com",
      password: "eaeaeaeaeaeaea",
    })
    .expect(200);

  //Chequeo adicional para ver que efectivamente se cambio. ToEqual o ToBe en estos casos funcionan indsitintamente.
  const user = await User.findById(userOneId);
  expect(user.email).toEqual("uwu@example.com");
  //expect(user.password).toBe("eaeaeaeaeaeaea"); No xq se hace el hash
});

test("Should NOT update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "nada que ver mar",
    })
    .expect(400);
});

/*
router.patch("/users/me", auth, async (req, res) => {
  //Lo que quiere modificar con la req lo podemos obtener:
  const updates = Object.keys(req.body); //Agarra el objeto y keys retorna un arreglo donde cada elemento es un atributo en req.body.
  const allowedUpdates = ["name", "email", "password", "age"];
  */
