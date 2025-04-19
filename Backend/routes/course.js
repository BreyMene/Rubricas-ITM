const express = require("express");
const router = express.Router();
const { Curso, Docente } = require("../types");

router.post("/", async (req, res) => {
  try {
    const { icono, nombre, docentes } = req.body;
    let curso = await Curso.findOne({ nombre });
    if (curso) {
      return res.status(409).json({ error: "course already created" });
    }

    const docentesF = [];

    for (const d of docentes) {
      const existente = await Docente.findOne({ correo: d.correo });

      if (existente) {
        docentesF.push({
          docente: existente._id,
          moderador: d.moderador,
        });
      }
    }

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
      { "docentes.docente": id },
      { docentes: 0 },
    );
    res.status(200).json(cursos);
  } catch {
    res.status(500).json({ error: "failed to get courses" });
  }
});

module.exports = router;
