const express = require("express");
const router = express.Router();
const { Grupo, Curso } = require("../utils/types");

router.post("/", async (req, res) => {
  try {
    const { cursoId, nombre, estudiantes, docente } = req.body;
    let grupo = await Grupo.findOne({nombre});
    if (grupo) {
        return res.status(409).json({ error: "group already created" });
    }
    grupo = new Grupo({nombre, estudiantes, docente});
    await grupo.save();

    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    curso.grupos.push(grupo._id);
    await curso.save();

    res.status(201).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to create group" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await Grupo.findById(id).populate("docente");
    res.status(200).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to get groups" });
  }
});

module.exports = router;
