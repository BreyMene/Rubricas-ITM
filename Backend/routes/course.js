const express = require("express");
const router = express.Router();
const { Curso } = require("../utils/types");
const { ValidarDocentes } = require("../utils/validations");

router.post("/", async (req, res) => {
  try {
    const { icono, nombre, docentes } = req.body;
    let curso = await Curso.findOne({ nombre });
    if (curso) {
      return res.status(409).json({ error: "course already created" });
    }

    const docentesF = await ValidarDocentes(docentes);

    curso = new Curso({ icono: icono, nombre: nombre, docentes: docentesF });
    await curso.save();
    res.status(201).json(curso);
  } catch {
    res.status(500).json({ error: "failed to create course" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cursos = await Curso.find(
      { "docentes._id": id },
      { docentes: 0 },
    );
    res.status(200).json(cursos);
  } catch {
    res.status(500).json({ error: "failed to get courses" });
  }
});

module.exports = router;
