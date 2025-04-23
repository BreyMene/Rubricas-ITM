const express = require("express");
const router = express.Router();
const { Grupo, Curso } = require("../utils/types");

router.post("/", async (req, res) => {
  try {
    const { nombre, estudiantes, docente } = req.body;
    let grupo = await Grupo.find({nombre});
    if (grupo) {
        return res.status(409).json({ error: "group already created" });
    }
    grupo = new Grupo({nombre, estudiantes, docente});
    await grupo.save();
    res.status(201).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to create group" });
  }
});

// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const curso = await Curso.findById(id).populate({
//         path: "grupos"
//     });
//     res.status(200).json(curso.grupos);
//   } catch {
//     res.status(500).json({ error: "failed to get groups" });
//   }
// });

module.exports = router;
