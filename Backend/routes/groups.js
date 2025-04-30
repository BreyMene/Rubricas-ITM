const express = require("express");
const router = express.Router();
const { Grupo, Curso } = require("../utils/types");

// Create a new group
router.post("/", async (req, res) => {
  try {
    const { cursoId, nombre, estudiantes, docente } = req.body;
    const curso = await Curso.findById(cursoId).populate("grupos");
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }
    const grupoE = curso.grupos.find((g) => g.nombre === nombre);
    if (grupoE) {
      return res.status(409).json({ error: "group already created" });
    }

    const grupo = new Grupo({ nombre, estudiantes, docente });
    await grupo.save();
    await grupo.populate("docente");

    curso.grupos.push(grupo._id);
    await curso.save();

    res.status(201).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to create group" });
  }
});

// Get a group
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await Grupo.findById(id).populate([
      {
        path: "docente",
      },
      {
        path: "rubricas",
        select: "nombre",
      }
    ]);
    res.status(200).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to get groups" });
  }
});

// delete users from a group
router.delete("/:id/user/:c", async (req, res) => {
  try {
    const { id, c } = req.params;
    const grupo = await Grupo.findById(id);
    if (!grupo) {
      return res.status(404).json({ error: "group not found" });
    }

    grupo.estudiantes = grupo.estudiantes.filter((e) => e.correo !== c);
    await grupo.save();

    res.status(200).json({ message: "estudiante removed successfully" });
  } catch {
    res.status(500).json({ error: "failed to delete docente" });
  }
});

module.exports = router;
