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
    await curso.populate("docentes._id")

    const cursoObj = curso.toObject();
    cursoObj.docentes = cursoObj.docentes.map((d)=> {
      return {
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo
      }
    })

    res.status(201).json(cursoObj);
  } catch {
    res.status(500).json({ error: "failed to create course" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cursos = await Curso.find({"docentes._id": id }).populate("docentes._id");
    const cursosObj = cursos.map((curso)=> {
      const c = curso.toObject();
      c.docentes = c.docentes.map((d)=> ({
          moderador: d.moderador,
          _id: d._id._id,
          correo: d._id.correo
        }));
      return c
    })
    res.status(200).json(cursosObj);
  } catch {
    res.status(500).json({ error: "failed to get courses" });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findById(id).populate("docentes._id");
    const cursoObj = curso.toObject();
    cursoObj.docentes = cursoObj.docentes.map((d)=> {
      return {
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo
      }
    })
    res.status(200).json(cursoObj);
  } catch {
    res.status(500).json({ error: "failed to get courses" });
  }
});

router.get("/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findById(id).populate({
      path: "grupos",
      populate: {
        path: "docente",
      }
    });

    res.status(200).json(curso.grupos);
  } catch {
    res.status(500).json({ error: "failed to get groups" });
  }
});

module.exports = router;
