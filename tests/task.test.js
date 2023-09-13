const request = require("supertest");
const Task = require("../src/models/task");
const app = require("../src/app");

//Importamos lo mismo que user.test.js. Puede pasar que los text se pisen entre si, por esto en el script agregamos --runInBan para asegurarnos que los test sean en serie y no en paralelo para evitar posibles errores.
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require("./fixtures/db");
beforeEach(setupDatabase);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "From my test bitch",
    })
    .expect(201);

  //Ya con el simple hecho de encontrarlo en la database sabemos que efectivamente se guardo. Pero para terminar de chequear que se agrego bien, expect algun de esos valores.
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test("Should fetch user tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test("Should fetch user tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

//No tiene sentido el xq chota no anda!!!

test("Should not delete other users tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(500);
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
