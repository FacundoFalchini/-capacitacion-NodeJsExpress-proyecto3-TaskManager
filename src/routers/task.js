const express = require("express");
const router = new express.Router();
const auth = require("../middleware/authentication");
const Task = require("../models/task");

router.get("/test", (req, res) => {
  res.send("This is from my other router");
});

module.exports = router;

//HTTP endpoint para CREAR tasks. A su vez, una vez autentificado queremos que la CREACION de la TASK este asociada al que la crea.

router.post("/tasks", auth, async (req, res) => {
  //const task = new Task(req.body); viejo.
  const task = new Task({
    //Con es spreed operator, nos copia todas las opciones por separadas que se pasan como json en la request, la descripcion y el completed
    ...req.body,
    //Y hardcodeamos el owner (xq no se especifica por la request)
    owner: req.user._id, //La persona que recien se autentifico.
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

//HTTP endpoint para LEER todos los tasks:
//GET /tasks?complted=valor
//GET /tasks?limit=valor1&skip=valor2
//limit nos permite limitar la cantidad de resultados y skip permite iterar en las paginas.
//GET /tasks?sortBy=createdAt_asc o desc
router.get("/tasks", auth, async (req, res) => {
  try {
    //Alternativa:
    //const tasks = await Task.find({ owner: req.user._id });
    //res.send(tasks);

    //Aca obtenemos el valor colocado en la url
    const match = {};
    const sort = {};

    //Si no se provee el valor... esta vacio y se muestra todo. Si se provee se pone true o false.
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
      //Si es sortBy=CreatedAt:desc ---> sort.CreatedAt = -1
    }

    await req.user.populate({
      path: "tasks",
      match,
      //Este objeto que agregamos sirve para paginacion y tambien para sorting
      options: {
        limit: parseInt(req.query.limit), //String q contiene un valor, a un entero
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    //.exec();

    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

//HTTP endpoint para LEER un task por ID:

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    //const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id: _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(404).send();
  }
});

//HTTP endpoint para ACTUALIZAR un task por ID:

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    /*
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    */

    //const task = await Task.findById(req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.body[update]; //No podemos hacer . porque no sabemos que propiedad, es dinamico, entonces usamos la notacion []
    });
    await task.save(); //Y ACA ES DONDE SE VA A EJECUTAR MIDDLEWAR.
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//HTTP endpoint para eliminar un task por id
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    //findbyidanddelete no sirve xq no podemos darle un objeto.
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).res.send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
